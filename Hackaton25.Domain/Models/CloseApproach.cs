using System.ComponentModel.DataAnnotations;

namespace Hackaton25.Domain.Models;

public class CloseApproach
{
    [Key]
    public int Id { get; set; }
    
    public DateTime ApproachDate { get; set; }         // Дата максимального сближения
    public double Distance { get; set; }               // Расстояние (а.е.)
    
    // Навигационные свойства
    public int CometId { get; set; }
    public Comet Comet { get; set; } = null!;
    public int OrbitalParametersId { get; set; }
    public OrbitalParameters OrbitalParameters { get; set; } = null!;
}