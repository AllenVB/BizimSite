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
public class ComplaintsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public ComplaintsController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var claim = User.FindFirst("tenantId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var tenantId = GetTenantId();

        var q = _db.Complaints.Include(c => c.User).Where(c => c.TenantId == tenantId).AsQueryable();
        if (role == "resident") q = q.Where(c => c.UserId == userId);

        var list = await q.OrderByDescending(c => c.CreatedAt).Select(c => new ComplaintResponse(
            c.Id, c.Title, c.Description, c.Status, c.IsAnonymous,
            c.IsAnonymous ? "Anonim" : (c.User != null ? c.User.Name : ""),
            c.IsAnonymous ? "" : (c.User != null ? c.User.Block : ""),
            c.IsAnonymous ? "" : (c.User != null ? c.User.No : ""),
            c.AdminNote, c.CreatedAt
        )).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ComplaintRequest req)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var c = new Complaint { Title = req.Title, Description = req.Description, IsAnonymous = req.IsAnonymous, UserId = userId, TenantId = GetTenantId() };
        _db.Complaints.Add(c);
        await _db.SaveChangesAsync();
        return Ok(new { id = c.Id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,kapici")]
    public async Task<IActionResult> Update(int id, ComplaintUpdateRequest req)
    {
        var c = await _db.Complaints.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == GetTenantId());
        if (c == null) return NotFound();
        c.Status = req.Status; c.AdminNote = req.AdminNote;
        if (req.Status == "resolved") c.ResolvedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Güncellendi" });
    }
}
