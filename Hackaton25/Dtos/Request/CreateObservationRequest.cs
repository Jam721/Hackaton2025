namespace Hackaton25.Dtos.Request;

public record CreateObservationRequest
{
    public DateTime ObservationTime { get; set; }
    public double RightAscension { get; set; } // Прямое восхождение (в часах или градусах)
    public double Declination { get; set; }    // Склонение (в градусах)
    
    // Навигационные свойства
    public int CometId { get; set; }
}