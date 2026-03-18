namespace BizimSite.API.Models;
public class Message
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Text { get; set; } = string.Empty;
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
