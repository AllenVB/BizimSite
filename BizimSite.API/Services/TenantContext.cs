namespace BizimSite.API.Services;

public class TenantContext
{
    public int? TenantId { get; set; }
    public string? Slug { get; set; }
    public bool IsSuperAdmin { get; set; } = false;
    public string PlanType { get; set; } = "basic";

    public bool HasPlan(string required) => required switch
    {
        "premium"    => PlanType is "premium" or "enterprise",
        "enterprise" => PlanType == "enterprise",
        _            => true
    };
}
