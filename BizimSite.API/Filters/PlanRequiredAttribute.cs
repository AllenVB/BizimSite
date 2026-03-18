using BizimSite.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace BizimSite.API.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class PlanRequiredAttribute : ActionFilterAttribute
{
    private readonly string _plan;

    public PlanRequiredAttribute(string plan) => _plan = plan;

    public override void OnActionExecuting(ActionExecutingContext ctx)
    {
        var tenantCtx = ctx.HttpContext.RequestServices.GetRequiredService<TenantContext>();

        // SuperAdmin her zaman geçer
        if (tenantCtx.IsSuperAdmin) return;

        if (!tenantCtx.HasPlan(_plan))
        {
            var planLabel = _plan switch
            {
                "premium"    => "Premium",
                "enterprise" => "Enterprise",
                _            => _plan
            };

            ctx.Result = new ObjectResult(new
            {
                message = $"Bu özellik {planLabel} plana özeldir. Planınızı yükseltmek için yöneticinizle iletişime geçin.",
                requiredPlan = _plan,
                currentPlan = tenantCtx.PlanType
            })
            { StatusCode = 403 };
        }
    }
}
