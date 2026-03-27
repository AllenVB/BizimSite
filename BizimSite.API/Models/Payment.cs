namespace BizimSite.API.Models;
public class Payment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, confirmed, rejected
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    public string? DekontUrl { get; set; }
    public string? DekontNote { get; set; }
    public string? AdminNote { get; set; }
}
