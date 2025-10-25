namespace Hackaton25.Dtos.Response;

public record OrbitalParametersResponse(
    double SemiMajorAxis,
    double Eccentricity,
    double Inclination,
    double LongitudeOfAscendingNode,
    double ArgumentOfPeriapsis,
    double TimeOfPeriapsisPassage,
    int CometId
    );