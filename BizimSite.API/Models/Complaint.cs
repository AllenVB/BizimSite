using System.ComponentModel.DataAnnotations;
namespace BizimSite.API.Models;
public class Complaint
{
    public int Id { get; set; }
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public bool IsAnonymous { get; set; } = false;
    public int UserId { get; set; }
    public User? User { get; set; }
    public string? AdminNote { get; set; }
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
