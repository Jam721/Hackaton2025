using Hackaton25.Domain;
using Hackaton25.Domain.Models;
using Hackaton25.Dtos;
using Hackaton25.Dtos.Request;
using Hackaton25.Dtos.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hackaton25.Controllers;

[ApiController]
[Route("api/observation")]
public class ObservationsController(AppDbContext context) : ControllerBase
{
    [HttpGet("all")]
    public async Task<IActionResult> GetObservations(CancellationToken ct)
    {
        return Ok(await context.Observations
            .Select(o=>o.MapObservation())
            .ToListAsync(ct));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetObservation(int id, CancellationToken ct)
    {
        var observation = await context.Observations
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (observation == null)
            return NotFound("Observation not found");
        
        return Ok(observation.MapObservation());
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateObservation(CreateObservationRequest request, CancellationToken ct)
    {
        var comet = await context.Comets.FirstOrDefaultAsync(c=>c.Id==request.CometId, ct);

        if (comet == null)
            return NotFound("Comet not found");
        
        var observation = new Observation
        {
            ObservationTime = request.ObservationTime,
            RightAscension = request.RightAscension,
            Declination = request.Declination,
            CometId = request.CometId,
            Comet = comet
        };

        await context.Observations.AddAsync(observation, ct);
        await context.SaveChangesAsync(ct);

        return Ok(observation.MapObservation());
    }

    [HttpGet("send/{cometId:int}")]
    public async Task<IActionResult> SendObservations(int cometId, CancellationToken ct)
    {
        var observations = await context.Observations
            .Where(o => o.CometId == cometId)
            .Select(o=>
                new SendObservationResponse(
                    o.ObservationTime, 
                    o.RightAscension, 
                    o.Declination))
            .ToListAsync(ct);
        
        return Ok(observations);
    }

    [HttpDelete("delete/{id:int}")]
    public async Task<IActionResult> DeleteObservation(int id, CancellationToken ct)
    {
        var observation = await context.Observations.FirstOrDefaultAsync(o => o.Id == id, ct);

        if (observation == null)
            return NotFound("Observation not found");

        context.Observations.Remove(observation);
        await context.SaveChangesAsync(ct);

        return NoContent();
    }
}