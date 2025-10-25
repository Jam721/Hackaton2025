namespace Hackaton25.Dtos.Response;

public record CloseApproachResponse(
    DateTime ApproachDate,
    double Distance,
    int CometId,
    int OrbitalParametersId);