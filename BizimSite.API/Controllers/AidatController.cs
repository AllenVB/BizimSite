using BizimSite.API.Data;
using BizimSite.API.DTOs;
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
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> UpdateConfig([FromBody] AidatConfig req)
    {
        var config = await _db.AidatConfigs.FirstOrDefaultAsync(c => c.TenantId == GetTenantId());
        if (config == null) return NotFound();
        config.DueDay = req.DueDay;
        config.CurrentMonth = req.CurrentMonth;
        config.Amount = req.Amount;
        config.IbanNo = req.IbanNo;
        config.AccountHolder = req.AccountHolder;
        config.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(config);
    }

    [HttpPost("new-month")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> StartNewMonth([FromBody] NewMonthRequest req)
    {
        var tenantId = GetTenantId();
        var config = await _db.AidatConfigs.FirstOrDefaultAsync(c => c.TenantId == tenantId);
        if (config != null)
        {
            // Mevcut dönemi önceki olarak sakla (geri alma için)
            config.PreviousMonth = config.CurrentMonth;
            config.PreviousStartDate = config.PeriodStartDate;
            config.PreviousEndDate = config.PeriodEndDate;

            config.CurrentMonth = req.MonthName;
            config.PeriodStartDate = req.StartDate;
            config.PeriodEndDate = req.EndDate;
            config.UpdatedAt = DateTime.UtcNow;
        }

        // Sadece sakinlerin ödeme durumunu sıfırla
        var users = await _db.Users
            .Where(u => u.TenantId == tenantId && u.Role == "resident")
            .ToListAsync();
        foreach (var u in users) u.Paid = false;

        _db.Announcements.Add(new Announcement
        {
            Title = $"{req.MonthName} Aidat Bildirimi",
            Content = $"{req.MonthName} dönemi aidat ödemesi başlamıştır.",
            Author = "Sistem",
            AuthorRole = "admin",
            TenantId = tenantId
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = $"{req.MonthName} başlatıldı" });
    }

    [HttpPost("rollback-month")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> RollbackMonth()
    {
        var tenantId = GetTenantId();
        var config = await _db.AidatConfigs.FirstOrDefaultAsync(c => c.TenantId == tenantId);
        if (config == null || string.IsNullOrEmpty(config.PreviousMonth))
            return BadRequest(new { message = "Geri alınacak önceki dönem bulunamadı." });

        config.CurrentMonth = config.PreviousMonth;
        config.PeriodStartDate = config.PreviousStartDate;
        config.PeriodEndDate = config.PreviousEndDate;
        config.PreviousMonth = null;
        config.PreviousStartDate = null;
        config.PreviousEndDate = null;
        config.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Önceki döneme geri dönüldü." });
    }
}
