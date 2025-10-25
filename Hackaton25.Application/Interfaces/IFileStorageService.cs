namespace Hackaton25.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default);
    Task<bool> DeletePhotoAsync(string fileName, CancellationToken ct = default);
    Task<Stream> GetPhotoAsync(string fileName, CancellationToken ct = default);
    Task<bool> PhotoExistsAsync(string fileName, CancellationToken ct = default);
    Task<string> GenerateFileName();
}