namespace Hackaton25.Dtos.Response;

public record ObservationResponse(
    DateTime ObservationTime,
    double RightAscension,
    double Declination,
    int CometId
    );
