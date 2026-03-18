namespace BizimSite.API.Models;
public class AidatConfig
{
    public int Id { get; set; }
    public int DueDay { get; set; } = 1;
    public string CurrentMonth { get; set; } = string.Empty;
    public decimal Amount { get; set; } = 0;
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
