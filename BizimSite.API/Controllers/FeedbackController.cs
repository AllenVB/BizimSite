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
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;

    public FeedbackController(AppDbContext db, TenantContext tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    [HttpPost]
    public async Task<IActionResult> Submit(FeedbackRequest req)
    {
        var userId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var uid) ? uid : (int?)null;
        var name = User.FindFirst(ClaimTypes.Name)?.Value ?? "Bilinmiyor";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "resident";

        var feedback = new Feedback
        {
            Title = req.Title,
            Message = req.Message,
            Type = req.Type,
            UserId = userId,
            TenantId = _tenant.TenantId,
            SenderName = name,
            SenderRole = role
        };

        _db.Feedbacks.Add(feedback);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Geri bildiriminiz alındı, teşekkürler!" });
    }

    [HttpGet]
    [Authorize(Roles = "superadmin")]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Feedbacks
            .Include(f => f.Tenant)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FeedbackResponse(
                f.Id, f.Title, f.Message, f.Type,
                f.Status, f.SenderName, f.SenderRole,
                f.Tenant != null ? f.Tenant.Name : null,
                f.CreatedAt
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "superadmin")]
    public async Task<IActionResult> UpdateStatus(int id, FeedbackStatusRequest req)
    {
        var feedback = await _db.Feedbacks.FindAsync(id);
        if (feedback == null) return NotFound();
        feedback.Status = req.Status;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Güncellendi" });
    }
}
