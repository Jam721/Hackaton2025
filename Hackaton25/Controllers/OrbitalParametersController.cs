using System.Security.Claims;
using Hackaton25.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hackaton25.Controllers;

[ApiController]
[Route("api/parameters")]
public class OrbitalParametersController(AppDbContext context) : ControllerBase
{
    [HttpGet("get-six-parameters/{cometId:int}")]
    public async Task<IActionResult> GetSixParameters(int cometId, CancellationToken ct)
    {
        var parameters = await context.OrbitalParameters
            .Where(p => p.CometId == cometId)
            .ToListAsync(ct);

        if (parameters.Count == 0)
        {
            return NotFound("Не было рассчетов");
        }

        return Ok(parameters);
    }

    [HttpGet("get-two-parameters/{cometId:int}")]
    public async Task<IActionResult> GetTwoParameters(int cometId, CancellationToken ct)
    {
        var parameters = await context.CloseApproaches
            .Where(p => p.CometId == cometId)
            .ToListAsync(ct);
        
        if (parameters.Count == 0)
        {
            return NotFound("Не было рассчетов");
        }
        
        

        return Ok(parameters);
    }

    [HttpDelete("delete-two-parameters/{id:int}")]
    public async Task<IActionResult> DeleteTwoParameters(int id, CancellationToken ct)
    {
        var deleted = await context.CloseApproaches
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (deleted == null)
            return NotFound();

        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        
        if (deleted.UserEmail == userEmail)
        {
            context.CloseApproaches.Remove(deleted);
            await context.SaveChangesAsync(ct);

            return Ok(deleted);
        }

        return BadRequest("Нет прав");
    }
    
    [HttpDelete("delete-six-parameters/{id:int}")]
    public async Task<IActionResult> DeleteSixParameters(int id, CancellationToken ct)
    {
        var deleted = await context.OrbitalParameters
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (deleted == null)
            return NotFound();
        
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        
        if (deleted.UserEmail == userEmail)
        {
            context.OrbitalParameters.Remove(deleted);
            await context.SaveChangesAsync(ct);

            return Ok(deleted);
        }

        return Ok(deleted);
    }
}