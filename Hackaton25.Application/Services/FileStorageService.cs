using Hackaton25.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;

namespace Hackaton25.Application.Services;

public class FileStorageService(
    IMinioClient minioClient,
    ILogger<FileStorageService> logger,
    IConfiguration configuration)
    : IFileStorageService
{
    private readonly string _bucketName = configuration["Minio:BucketName"] ?? "photos";

    public async Task<string> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default)
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs()
                .WithBucket(_bucketName);
            var bucketExists = await minioClient.BucketExistsAsync(bucketExistsArgs, ct);
            
            if (!bucketExists)
            {
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(_bucketName);
                await minioClient.MakeBucketAsync(makeBucketArgs, ct);
            }

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType("image/jpeg");

            await minioClient.PutObjectAsync(putObjectArgs, ct);
            
            logger.LogInformation("Photo uploaded successfully: {FileName}", fileName);
            return fileName;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading photo to MinIO");
            throw;
        }
    }
    
    public Task<string> GenerateFileName()
    {
        return Task.FromResult($"{Guid.NewGuid()}.jpg");
    }

    public async Task<bool> DeletePhotoAsync(string fileName, CancellationToken ct = default)
    {
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName);

            await minioClient.RemoveObjectAsync(removeObjectArgs, ct);
            
            logger.LogInformation("Photo deleted successfully: {FileName}", fileName);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting photo from MinIO: {FileName}", fileName);
            return false;
        }
    }

    public async Task<Stream> GetPhotoAsync(string fileName, CancellationToken ct = default)
    {
        try
        {
            var memoryStream = new MemoryStream();
            
            var getObjectArgs = new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName)
                .WithCallbackStream(stream => stream.CopyTo(memoryStream));

            await minioClient.GetObjectAsync(getObjectArgs, ct);
            
            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving photo from MinIO: {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> PhotoExistsAsync(string fileName, CancellationToken ct = default)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName);

            await minioClient.StatObjectAsync(statObjectArgs, ct);
            return true;
        }
        catch
        {
            return false;
        }
    }
}