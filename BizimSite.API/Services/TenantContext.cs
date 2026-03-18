namespace BizimSite.API.Services;
public class TenantContext
{
    public int? TenantId { get; set; }
    public string? Slug { get; set; }
    public bool IsSuperAdmin { get; set; } = false;
}
