using BizimSite.API.Data;
using BizimSite.API.Models;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizimSite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AidatController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public AidatController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var claim = HttpContext.User.FindFirst("tenantId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet("config")]
    public async Task<IActionResult> GetConfig()
    {
        var config = await _db.AidatConfigs.FirstOrDefaultAsync(c => c.TenantId == GetTenantId());
        return Ok(config);
    }

    [HttpPut("config")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateConfig([FromBody] AidatConfig req)
    {
        var config = await _db.AidatConfigs.FirstOrDefaultAsync(c => c.TenantId == GetTenantId());
        if (config == null) return NotFound();
        config.DueDay = req.DueDay; config.CurrentMonth = req.CurrentMonth;
        config.Amount = req.Amount; config.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(config);
    }

    [HttpPost("new-month")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> StartNewMonth([FromBody] string monthName)
    {
        var tenantId = GetTenantId();
        var users = await _db.Users.Where(u => u.TenantId == tenantId).ToListAsync();
        foreach (var u in users) u.Paid = false;
        var config = await _db.AidatConfigs.FirstOrDefaultAsync(c => c.TenantId == tenantId);
        if (config != null) config.CurrentMonth = monthName;
        _db.Announcements.Add(new Announcement
        {
            Title = $"{monthName} Aidat Bildirimi",
            Content = $"{monthName} dönemi aidat ödemesi başlamıştır.",
            Author = "Sistem", AuthorRole = "admin", TenantId = tenantId
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = $"{monthName} başlatıldı" });
    }
}
