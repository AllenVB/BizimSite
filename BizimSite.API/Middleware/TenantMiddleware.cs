using BizimSite.API.Data;
using BizimSite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace BizimSite.API.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, AppDbContext db, TenantContext tenantCtx)
    {
        // X-Tenant-Slug header veya subdomain'den oku
        var slug = context.Request.Headers["X-Tenant-Slug"].FirstOrDefault();

        if (string.IsNullOrEmpty(slug))
        {
            // Subdomain'den çıkar: gunesapt.bizimsite.com → gunesapt
            var host = context.Request.Host.Host;
            var parts = host.Split('.');
            if (parts.Length >= 3) slug = parts[0]; // subdomain
        }

        if (!string.IsNullOrEmpty(slug) && slug != "panel" && slug != "www" && slug != "api")
        {
            var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive);
            if (tenant != null)
            {
                tenantCtx.TenantId = tenant.Id;
                tenantCtx.Slug = slug;
            }
        }

        await _next(context);
    }
}
