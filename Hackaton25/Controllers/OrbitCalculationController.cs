using System.Text.Json;
using Hackaton25.Domain;
using Hackaton25.Domain.Models;
using Hackaton25.Dtos;
using Hackaton25.Dtos.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hackaton25.Controllers;

[ApiController]
[Route("api/calculation")]
public class OrbitCalculationController(
    AppDbContext context, IHttpClientFactory factory)
    : ControllerBase
{
    [HttpGet("convergation/{cometId:int}")]
    public async Task<IActionResult> GetConvergation(int cometId, CancellationToken ct)
    {
        try
        {
            var observations = await context.Observations
                .Where(o => o.CometId == cometId)
                .Select(o => new SendObservationResponse(
                    o.ObservationTime, 
                    o.RightAscension, 
                    o.Declination))
                .ToListAsync(ct);

            if (observations.Count == 0)
            {
                return NotFound($"No observations found for comet {cometId}");
            }

            var client = factory.CreateClient();
        
            var requestOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            
            var response = await client.PostAsJsonAsync(
                "http://localhost:8000/users/conv/", 
                observations,
                requestOptions,
                ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                return StatusCode((int)response.StatusCode, 
                    $"Ошибка получения данных: {errorContent}");
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            Console.WriteLine($"Received JSON: {json}");

            // Добавьте опции для десериализации
            var responseOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true
            };

            var orbitalParameters = JsonSerializer.Deserialize<OrbitalParameters>(json, responseOptions);

            if (orbitalParameters == null)
            {
                return BadRequest("Невозможно десериализовать данные");
            }
        
            orbitalParameters.CometId = cometId;

            await context.OrbitalParameters.AddAsync(orbitalParameters, ct);
            await context.SaveChangesAsync(ct);

            return Ok(orbitalParameters.MapOrbitalParameters());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
        }
    }

    [HttpGet("last_params/{cometId:int}/{orbitalParametersId:int}")]
    public async Task<IActionResult> LastData(int cometId, int orbitalParametersId, CancellationToken ct)
    {
        try
        {
            var observations = await context.Observations
                .Where(o => o.CometId == cometId)
                .Select(o => new SendObservationResponse(
                    o.ObservationTime, 
                    o.RightAscension, 
                    o.Declination))
                .ToListAsync(ct);

            if (observations.Count == 0)
            {
                return NotFound($"No observations found for comet {cometId}");
            }

            var client = factory.CreateClient();
        
            var requestOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            
            var response = await client.PostAsJsonAsync(
                "http://localhost:8000/users/orbit/", 
                observations,
                requestOptions,
                ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                return StatusCode((int)response.StatusCode, 
                    $"Ошибка получения данных: {errorContent}");
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            Console.WriteLine($"Received JSON: {json}");

            // Добавьте опции для десериализации
            var responseOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true
            };

            var closeAppeoach = JsonSerializer.Deserialize<CloseApproach>(json, responseOptions);

            if (closeAppeoach == null)
            {
                return BadRequest("Невозможно десериализовать данные");
            }
        
            closeAppeoach.CometId = cometId;

            await context.CloseApproaches.AddAsync(closeAppeoach, ct);
            await context.SaveChangesAsync(ct);

            return Ok(closeAppeoach.MapCloseApproach());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
        }
    }
}