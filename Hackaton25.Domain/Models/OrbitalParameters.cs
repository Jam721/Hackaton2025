using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Hackaton25.Domain.Models;

public class OrbitalParameters
{
    [Key]
    public int Id { get; set; }
    
    // 6 основных параметров орбиты
    [JsonPropertyName("semiMajorAxis")]
    public double SemiMajorAxis { get; set; }          // Большая полуось (а.е.)
    [JsonPropertyName("eccentricity")]
    public double Eccentricity { get; set; }           // Эксцентриситет
    [JsonPropertyName("inclination")]
    public double Inclination { get; set; }            // Наклонение (градусы)
    [JsonPropertyName("longitudeOfAscendingNode")]
    public double LongitudeOfAscendingNode { get; set; } // Долгота восходящего узла (градусы)
    [JsonPropertyName("argumentOfPeriapsis")]
    public double ArgumentOfPeriapsis { get; set; }    // Аргумент перицентра (градусы)
    [JsonPropertyName("timeOfPeriapsisPassage")]
    public double TimeOfPeriapsisPassage { get; set; } // Время прохождения перигелия
    
    
    // Навигационные свойства
    public int CometId { get; set; }
    public Comet Comet { get; set; } = null!;
}