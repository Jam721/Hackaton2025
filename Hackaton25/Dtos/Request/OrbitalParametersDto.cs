namespace Hackaton25.Application.Dto.Python;

public record OrbitalParametersDto
{
    public double SemiMajorAxis { get; set; }          // Большая полуось (а.е.)
    public double Eccentricity { get; set; }           // Эксцентриситет
    public double Inclination { get; set; }            // Наклонение (градусы)
    public double LongitudeOfAscendingNode { get; set; } // Долгота восходящего узла (градусы)
    public double ArgumentOfPeriapsis { get; set; }    // Аргумент перицентра (градусы)
    public DateTime TimeOfPeriapsisPassage { get; set; } // Время прохождения перигелия
}