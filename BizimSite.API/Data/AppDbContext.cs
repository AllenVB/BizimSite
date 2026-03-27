using Microsoft.EntityFrameworkCore;
using BizimSite.API.Models;

namespace BizimSite.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Complaint> Complaints => Set<Complaint>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<GarbageTracking> GarbageTrackings => Set<GarbageTracking>();
    public DbSet<BorrowRequest> BorrowRequests => Set<BorrowRequest>();
    public DbSet<BorrowResponse> BorrowResponses => Set<BorrowResponse>();
    public DbSet<AidatConfig> AidatConfigs => Set<AidatConfig>();
    public DbSet<Block> Blocks => Set<Block>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Tenant>().HasIndex(t => t.Slug).IsUnique();

        // User.TenantId nullable (SuperAdmin için)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(u => u.TenantId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
