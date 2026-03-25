using BizimSite.API.Data;
using BizimSite.API.DTOs;
using BizimSite.API.Models;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace BizimSite.API.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GarbageController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public GarbageController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var today = DateTime.UtcNow.Date;
        var query = _db.GarbageTrackings.Include(g => g.User)
            .Where(g => g.MarkedAt.Date == today);
        if (_tenant.TenantId != null)
            query = query.Where(g => g.TenantId == _tenant.TenantId);
        var list = await query
            .Select(g => new GarbageResponse(g.Id, g.UserId, g.User != null ? g.User.Name : "", g.Block, g.No, g.IsReady, g.CollectedAt != null, g.MarkedAt, g.CollectedAt)).ToListAsync();
        return Ok(list);
    }

    [HttpPost("mark")]
    public async Task<IActionResult> Mark()
    {
        if (_tenant.TenantId == null) return BadRequest(new { message = "Tenant bulunamadı" });
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        if (await _db.GarbageTrackings.AnyAsync(g => g.UserId == userId && g.IsReady))
            return BadRequest(new { message = "Zaten isaretlendi" });
        _db.GarbageTrackings.Add(new GarbageTracking { UserId = userId, Block = user.Block, No = user.No, TenantId = _tenant.TenantId.Value });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Isaretlendi" });
    }

    [HttpDelete("unmark")]
    public async Task<IActionResult> Unmark()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var g = await _db.GarbageTrackings.FirstOrDefaultAsync(g => g.UserId == userId && g.IsReady);
        if (g == null) return NotFound();
        _db.GarbageTrackings.Remove(g);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Isaret kaldirildi" });
    }

    [HttpPut("{id}/collect")]
    [Authorize(Roles = "kapici,admin")]
    public async Task<IActionResult> Collect(int id)
    {
        var g = await _db.GarbageTrackings.FindAsync(id);
        if (g == null) return NotFound();
        g.IsReady = false; g.CollectedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Toplandi" });
    }
}
