using Microsoft.EntityFrameworkCore;
using BizimSite.Models;

namespace BizimSite.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }
    
    public DbSet<Apartment> Apartments { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserLoginSession> UserLoginSessions { get; set; }
    public DbSet<Due> Dues { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apartment configuration
        modelBuilder.Entity<Apartment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DaireNo).IsRequired().HasMaxLength(10);
            entity.Property(e => e.SahipAdi).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.DaireNo).IsUnique();
        });
        
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Ad).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Soyad).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });
        
        // Due configuration
        modelBuilder.Entity<Due>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Daire)
                  .WithMany(d => d.Aidatlar)
                  .HasForeignKey(e => e.DaireId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.DaireId, e.Yil, e.Ay }).IsUnique();
        });
        
        // Announcement configuration
        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Baslik).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Icerik).IsRequired();
        });
        
        // Expense configuration
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Aciklama).IsRequired().HasMaxLength(500);
        });
    }
}

