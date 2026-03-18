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

    [HttpGet]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = GetTenantId();
        var users = await _db.Users
            .Where(u => u.TenantId == tenantId && !u.IsMainAdmin)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Block, u.No, u.Role, u.Type, u.Paid, u.LastPayment, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Update(int id, UpdateUserRequest req)
    {
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
