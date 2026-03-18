using BizimSite.API.Data;
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
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public MessagesController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var claim = HttpContext.User.FindFirst("tenantId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = GetTenantId();
        var msgs = await _db.Messages.Include(m => m.User)
            .Where(m => m.TenantId == tenantId)
            .OrderBy(m => m.SentAt)
            .Select(m => new { m.Id, m.Text, m.SentAt, UserName = m.User != null ? m.User.Name : "", m.UserId })
            .ToListAsync();
        return Ok(msgs);
    }

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] string text)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var msg = new Message { UserId = userId, Text = text, TenantId = GetTenantId() };
        _db.Messages.Add(msg);
        await _db.SaveChangesAsync();
        return Ok(new { msg.Id, msg.SentAt });
    }
}
