using BizimSite.API.Data;
using BizimSite.API.DTOs;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizimSite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public UsersController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var tenantClaim = HttpContext.User.FindFirst("tenantId")?.Value;
        return int.TryParse(tenantClaim, out var id) ? id : 0;
    }

    // Sadece kendi binasının admin kullanıcılarını getir (superadmin hariç)
    [HttpGet("admins")]
    [Authorize]
    public async Task<IActionResult> GetAdmins()
    {
        var tenantId = GetTenantId();
        var admins = await _db.Users
            .Where(u => u.TenantId == tenantId && u.Role == "admin" && !u.IsSuperAdmin)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Block, u.No, u.Role, u.Type, u.Paid, u.LastPayment, u.CreatedAt))
            .ToListAsync();
        return Ok(admins);
    }

    [HttpGet]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = GetTenantId();
        var users = await _db.Users
            .Where(u => u.TenantId == tenantId && !u.IsMainAdmin && !u.IsSuperAdmin)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Block, u.No, u.Role, u.Type, u.Paid, u.LastPayment, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Update(int id, UpdateUserRequest req)
    {
        // Kapici rolü atamak Premium plan gerektirir
        if (req.Role == "kapici" && !_tenant.IsSuperAdmin && !_tenant.HasPlan("premium"))
            return StatusCode(403, new {
                message = "Kapıcı rolü Premium plana özeldir. Planınızı yükseltmek için yöneticinizle iletişime geçin.",
                requiredPlan = "premium",
                currentPlan = _tenant.PlanType
            });

        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        u.Name = req.Name; u.Email = req.Email; u.Phone = req.Phone;
        u.Block = req.Block; u.No = req.No; u.Role = req.Role; u.Type = req.Type;
        if (!string.IsNullOrEmpty(req.Password)) u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Güncellendi" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        _db.Users.Remove(u);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Silindi" });
    }
}
