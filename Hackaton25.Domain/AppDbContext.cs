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
    }
}
