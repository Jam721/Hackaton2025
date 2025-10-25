using Hackaton25.Application.Interfaces;
using Hackaton25.Domain;
using Hackaton25.Domain.Models;
using Hackaton25.Dtos;
using Hackaton25.Dtos.Request;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hackaton25.Controllers;

[ApiController]
[Route("api/comet")]
public class CometsController(AppDbContext context, IFileStorageService fileService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetComets(CancellationToken ct)
    {
        return Ok(await context.Comets
            .Include(c => c.Observations)
            .Include(c => c.OrbitalParametersHistory)
            .Include(c => c.CloseApproaches)
            .Select(c => c.MapComet())
            .ToListAsync(ct)
        );
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetComet(int id, CancellationToken ct)
    {
        var comet = await context.Comets
            .Include(c => c.Observations)
            .Include(c => c.OrbitalParametersHistory)
            .Include(c => c.CloseApproaches)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (comet == null)
        {
            return NotFound();
        }

        return Ok(comet.MapComet());
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateComet(CreateCometRequest request, CancellationToken ct)
    {
        var comet = new Comet
        {
            Name = request.Name,
            Designation = request.Designation,
            Description = request.Description,
            DiscoveryDate = request.DiscoveryDate ?? DateTime.UtcNow,
            Discoverer = request.Discoverer,
            CreatedAt = DateTime.UtcNow
        };

        if (request.File != null)
        {
            await using var stream = request.File.OpenReadStream();

            var newFileName = await fileService.GenerateFileName();

            await fileService.UploadPhotoAsync(stream, newFileName, ct);

            comet.ImageUrl = newFileName;
        }
        
        await context.Comets.AddAsync(comet, ct);
        await context.SaveChangesAsync(ct);

        return Ok(new
        {
            comet.Id
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteComet(int id, CancellationToken ct)
    {
        var comet = await context.Comets.FirstOrDefaultAsync(c=>c.Id==id, ct);
        if (comet == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(comet.ImageUrl))
        {
            await fileService.DeletePhotoAsync(comet.ImageUrl, ct);
        }

        context.Comets.Remove(comet);
        await context.SaveChangesAsync(ct);

        return NoContent();
    }
}