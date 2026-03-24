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
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public PaymentsController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

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

        var q = _db.Payments.Include(p => p.User).Where(p => p.TenantId == tenantId).AsQueryable();
        if (role == "resident") q = q.Where(p => p.UserId == userId);

        var list = await q.OrderByDescending(p => p.PaidAt).Select(p => new PaymentResponse(
            p.Id, p.UserId, p.User != null ? p.User.Name : "", p.User != null ? p.User.Block : "", p.User != null ? p.User.No : "",
            p.Amount, p.Description, p.Status, p.PaidAt)).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Pay(PaymentRequest req)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        _db.Payments.Add(new Payment { UserId = userId, Amount = req.Amount, Description = req.Description, TenantId = GetTenantId() });
        user.Paid = true;
        user.LastPayment = DateTime.UtcNow.ToString("d MMMM yyyy", new System.Globalization.CultureInfo("tr-TR"));
        await _db.SaveChangesAsync();
        return Ok(new { message = "Ödeme alındı" });
    }
}
