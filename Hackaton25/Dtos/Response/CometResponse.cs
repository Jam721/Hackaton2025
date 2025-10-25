namespace Hackaton25.Dtos.Response;

public record CometResponse(
    int Id,
    string Name,
    string? Designation,
    string? Description,
    DateTime DiscoveryDate,
    string? Discoverer,
    DateTime CreatedAt,
    string? ImageUrl
    );