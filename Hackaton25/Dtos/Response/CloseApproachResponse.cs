namespace Hackaton25.Dtos.Response;

public record CloseApproachResponse(
    DateTime ConvTime,
    double Distance,
    int CometId);