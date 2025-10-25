using Hackaton25.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hackaton25.Extensions;

public static class DbContextExtensions
{
    public static void AddDbContextExtensions(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("Database"));
        });
    }
    
    public static void UseDbContextExtensions(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
    }
}