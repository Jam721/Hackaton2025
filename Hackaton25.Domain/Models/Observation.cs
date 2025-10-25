using System.ComponentModel.DataAnnotations;

namespace Hackaton25.Domain.Models;

public class Observation
{
    [Key]
    public int Id { get; set; }
    public DateTime ObservationTime { get; set; }
    public double RightAscension { get; set; } // Прямое восхождение (в часах или градусах)
    public double Declination { get; set; }    // Склонение (в градусах)
    
    // Навигационные свойства
    public int CometId { get; set; }
    public Comet Comet { get; set; } = null!;
}