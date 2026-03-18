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
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;
    public AuthController(AppDbContext db, JwtService jwt) { _db = db; _jwt = jwt; }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "E-posta veya şifre hatalı" });

        // Tenant aktif mi?
        if (user.TenantId != null && user.Tenant?.IsActive == false)
            return Unauthorized(new { message = "Aboneliğiniz aktif değil" });

        // Binada kapıcı var mı?
        var hasKapici = user.TenantId.HasValue &&
            await _db.Users.AnyAsync(u => u.TenantId == user.TenantId && u.Role == "kapici");

        var token = _jwt.GenerateToken(user);
        return Ok(new {
            token,
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role,
            isMainAdmin = user.IsMainAdmin,
            isSuperAdmin = user.IsSuperAdmin,
            block = user.Block,
            no = user.No,
            paid = user.Paid,
            tenantId = user.TenantId,
            tenantSlug = user.Tenant?.Slug,
            tenantName = user.Tenant?.Name,
            planType = user.Tenant?.PlanType ?? "basic",
            hasKapici
        });
    }

    [HttpPost("register")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Register(RegisterRequest req, [FromServices] TenantContext tenantCtx)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "Bu e-posta zaten kayıtlı" });

        var tenantId = tenantCtx.TenantId;

        var user = new User
        {
            Name = req.Name, Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone = req.Phone, Block = req.Block, No = req.No,
            Role = req.Role, Type = req.Type,
            TenantId = tenantId
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Kullanıcı oluşturuldu", id = user.Id });
    }
}
