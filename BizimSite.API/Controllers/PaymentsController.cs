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
            p.Id, p.UserId, p.User != null ? p.User.Name : "", p.User != null ? p.User.Block ?? "" : "", p.User != null ? p.User.No ?? "" : "",
            p.Amount, p.Description, p.Status, p.PaidAt, p.DekontUrl, p.DekontNote, p.AdminNote)).ToListAsync();
        return Ok(list);
    }

    // Dekont yükle + bekleyen ödeme oluştur
    [HttpPost]
    public async Task<IActionResult> Pay(PaymentRequest req)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        _db.Payments.Add(new Payment
        {
            UserId = userId,
            Amount = req.Amount,
            Description = req.Description,
            Status = "pending",
            TenantId = GetTenantId(),
            DekontUrl = req.DekontUrl,
            DekontNote = req.DekontNote
        });
        // Ödeme admin onayına kadar user.Paid değişmez
        await _db.SaveChangesAsync();
        return Ok(new { message = "Dekontunuz alındı, admin onayı bekleniyor." });
    }

    // Admin: ödemeyi onayla veya reddet
    [HttpPut("{id}/status")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> UpdateStatus(int id, PaymentStatusRequest req)
    {
        var tenantId = GetTenantId();
        var payment = await _db.Payments.Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
        if (payment == null) return NotFound();

        payment.Status = req.Status; // "confirmed" veya "rejected"
        payment.AdminNote = req.AdminNote;

        if (req.Status == "confirmed" && payment.User != null)
        {
            payment.User.Paid = true;
            payment.User.LastPayment = DateTime.UtcNow.ToString("d MMMM yyyy", new System.Globalization.CultureInfo("tr-TR"));
        }
        else if (req.Status == "rejected" && payment.User != null)
        {
            // Reddedilince Paid durumunu geri al (başka onaylı ödeme yoksa)
            var hasConfirmed = await _db.Payments.AnyAsync(p =>
                p.UserId == payment.UserId && p.Status == "confirmed" && p.Id != id);
            if (!hasConfirmed) payment.User.Paid = false;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Durum güncellendi." });
    }
}
