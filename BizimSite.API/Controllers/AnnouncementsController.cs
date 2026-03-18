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
public class AnnouncementsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public AnnouncementsController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = GetTenantId();
        var list = await _db.Announcements
            .Where(a => a.TenantId == tenantId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementResponse(a.Id, a.Title, a.Content, a.Author, a.AuthorRole, a.CreatedAt))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "admin,kapici,superadmin")]
    public async Task<IActionResult> Create(AnnouncementRequest req)
    {
        var name = User.FindFirst(ClaimTypes.Name)?.Value ?? "Yetkili";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        var a = new Announcement { Title = req.Title, Content = req.Content, Author = name, AuthorRole = role, TenantId = GetTenantId() };
        _db.Announcements.Add(a);
        await _db.SaveChangesAsync();
        return Ok(new AnnouncementResponse(a.Id, a.Title, a.Content, a.Author, a.AuthorRole, a.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Announcements.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == GetTenantId());
        if (a == null) return NotFound();
        _db.Announcements.Remove(a);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Silindi" });
    }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var claim = User.FindFirst("tenantId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
