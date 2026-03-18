using System.ComponentModel.DataAnnotations;
namespace BizimSite.API.Models;
public class User
{
    public int Id { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public string Email { get; set; } = string.Empty;
    [Required] public string PasswordHash { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Block { get; set; } = string.Empty;
    public string No { get; set; } = string.Empty;
    public string Role { get; set; } = "resident"; // resident | admin | kapici | superadmin
    public string Type { get; set; } = "Kiracı";
    public bool IsMainAdmin { get; set; } = false;
    public bool IsSuperAdmin { get; set; } = false;
    public bool Paid { get; set; } = false;
    public string? LastPayment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Multi-tenant: null ise SuperAdmin
    public int? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
