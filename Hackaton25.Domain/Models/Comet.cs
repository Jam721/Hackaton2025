using System.ComponentModel.DataAnnotations;

namespace Hackaton25.Domain.Models;

public class Comet
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Description { get; set; }
    public DateTime DiscoveryDate { get; set; }
    public string? Discoverer { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string? ImageUrl { get; set; } = string.Empty;
    
    // Навигационные свойства
    public ICollection<Observation> Observations { get; set; } = new List<Observation>();
    public ICollection<OrbitalParameters> OrbitalParametersHistory { get; set; } = new List<OrbitalParameters>();
    public ICollection<CloseApproach> CloseApproaches { get; set; } = new List<CloseApproach>();
}