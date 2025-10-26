using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Hackaton25.Domain.Models;

public class CloseApproach
{
    [Key]
    public int Id { get; set; }
    
    [JsonPropertyName("convTime")]
    public DateTime ConvTime { get; set; }         // Дата максимального сближения
    [JsonPropertyName("distance")]
    public double Distance { get; set; }               // Расстояние (а.е.)
    
    [JsonPropertyName("userEmail")]
    public string? UserEmail { get; set; }
    
    // Навигационные свойства
    public int CometId { get; set; }
    public Comet Comet { get; set; } = null!;
    // public int OrbitalParametersId { get; set; }
    // public OrbitalParameters OrbitalParameters { get; set; } = null!;
}