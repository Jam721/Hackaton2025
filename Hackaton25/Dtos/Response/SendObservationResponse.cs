namespace Hackaton25.Dtos.Response;

public record SendObservationResponse(
    DateTime ObservationTime,
    double RightAscension,
    double Declination);