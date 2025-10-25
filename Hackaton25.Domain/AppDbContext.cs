using Hackaton25.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Hackaton25.Domain;

public class AppDbContext(DbContextOptions<AppDbContext> context) : DbContext(context)
{
    public DbSet<Comet> Comets { get; set; }
    public DbSet<Observation> Observations { get; set; }
    public DbSet<CloseApproach> CloseApproaches { get; set; }
    public DbSet<OrbitalParameters> OrbitalParameters { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CloseApproach>()
            .Property(e => e.ConvTime)
            .HasConversion(
                v => v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
            );
        
        // Данные для комет
        modelBuilder.Entity<Comet>().HasData(
            new Comet
            {
                Id = 1,
                Name = "Комета Галлея",
                Designation = "1P/Halley",
                Description = "Самая известная периодическая комета",
                DiscoveryDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Discoverer = "Эдмунд Галлей",
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                ImageUrl = "images/halley.jpg"
            },
            new Comet
            {
                Id = 2,
                Name = "Комета Хейла-Боппа",
                Designation = "C/1995 O1",
                Description = "Одна из самых ярких комет XX века",
                DiscoveryDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Discoverer = "Алан Хейл, Томас Бопп",
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                ImageUrl = "images/hale-bopp.jpg"
            },
            new Comet
            {
                Id = 3,
                Name = "Комета Чурюмова-Герасименко",
                Designation = "67P/Churyumov-Gerasimenko",
                DiscoveryDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Discoverer = "Клим Чурюмов, Светлана Герасименко",
                CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                ImageUrl = "images/67p.jpg"
            }
        );

        // Данные для орбитальных параметров
        modelBuilder.Entity<OrbitalParameters>().HasData(
            new OrbitalParameters
            {
                Id = 1,
                SemiMajorAxis = 17.8,
                Eccentricity = 0.967,
                Inclination = 162.3,
                LongitudeOfAscendingNode = 58.42,
                ArgumentOfPeriapsis = 111.33,
                TimeOfPeriapsisPassage = -0.27,
                CometId = 1
            },
            new OrbitalParameters
            {
                Id = 2,
                SemiMajorAxis = 186.0,
                Eccentricity = 0.995,
                Inclination = 89.4,
                LongitudeOfAscendingNode = 282.47,
                ArgumentOfPeriapsis = 130.59,
                TimeOfPeriapsisPassage = -0.27,
                CometId = 2
            },
            new OrbitalParameters
            {
                Id = 3,
                SemiMajorAxis = 3.46,
                Eccentricity = 0.641,
                Inclination = 7.04,
                LongitudeOfAscendingNode = 50.92,
                ArgumentOfPeriapsis = 12.66,
                TimeOfPeriapsisPassage = -0.27,
                CometId = 3
            }
        );

        // Данные для сближений
        modelBuilder.Entity<CloseApproach>().HasData(
            new CloseApproach
            {
                Id = 1,
                ConvTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Distance = 0.586,
                CometId = 1,
                OrbitalParametersId = 1
            },
            new CloseApproach
            {
                Id = 2,
                ConvTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Distance = 1.315,
                CometId = 2,
                OrbitalParametersId = 2
            },
            new CloseApproach
            {
                Id = 3,
                ConvTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Distance = 0.42,
                CometId = 3,
                OrbitalParametersId = 3
            },
            new CloseApproach
            {
                Id = 4,
                ConvTime = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                Distance = 0.477,
                CometId = 1,
                OrbitalParametersId = 1
            }
        );

        // Данные для наблюдений
        modelBuilder.Entity<Observation>().HasData(
            new Observation
            {
                Id = 1,
                ObservationTime = DateTime.Parse("2025-10-25T13:38:21.516Z").ToUniversalTime(),
                RightAscension = 15.5,
                Declination = 23.4,
                CometId = 1
            },
            new Observation
            {
                Id = 2,
                ObservationTime = DateTime.Parse("2025-10-25T14:22:10.123Z").ToUniversalTime(),
                RightAscension = 42.8,
                Declination = -12.7,
                CometId = 1
            },
            new Observation
            {
                Id = 3,
                ObservationTime = DateTime.Parse("2025-10-25T15:45:33.789Z").ToUniversalTime(),
                RightAscension = 128.3,
                Declination = 45.1,
                CometId = 1
            },
            new Observation
            {
                Id = 4,
                ObservationTime = DateTime.Parse("2025-10-25T16:30:05.456Z").ToUniversalTime(),
                RightAscension = 275.9,
                Declination = -67.2,
                CometId = 1
            },
            new Observation
            {
                Id = 5,
                ObservationTime = DateTime.Parse("2025-10-25T17:12:48.234Z").ToUniversalTime(),
                RightAscension = 320.1,
                Declination = 8.6,
                CometId = 1
            }
        );
    }
}
