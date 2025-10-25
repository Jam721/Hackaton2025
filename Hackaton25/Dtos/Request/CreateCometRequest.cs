using System.ComponentModel.DataAnnotations;

namespace Hackaton25.Dtos.Request;

public record CreateCometRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Description { get; set; }
    public DateTime? DiscoveryDate { get; set; }
    public string? Discoverer { get; set; }
    
    public IFormFile? File { get; set; }
}