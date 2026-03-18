namespace BizimSite.API.Models;
public class GarbageTracking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Block { get; set; } = string.Empty;
    public string No { get; set; } = string.Empty;
    public bool IsReady { get; set; } = true;
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime MarkedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CollectedAt { get; set; }
}
