using System.ComponentModel.DataAnnotations;

namespace BizimSite.API.Models;

public class Feedback
{
    public int Id { get; set; }
    [Required] public string Title { get; set; } = "";
    [Required] public string Message { get; set; } = "";
    public string Type { get; set; } = "general"; // general, bug, suggestion, compliment
    public string Status { get; set; } = "new";   // new, read, archived
    public int? UserId { get; set; }
    public User? User { get; set; }
    public int? TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string SenderName { get; set; } = "";
    public string SenderRole { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
