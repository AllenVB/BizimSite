namespace BizimSite.API.Models;
public class Block
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Floors { get; set; } = 1;
    public int ApartmentsPerFloor { get; set; } = 1;
    public int TotalApartments { get; set; } = 1;
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
