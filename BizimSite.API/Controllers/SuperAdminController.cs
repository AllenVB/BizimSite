using BizimSite.API.Data;
using BizimSite.API.DTOs;
using BizimSite.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizimSite.API.Controllers;

[ApiController]
[Route("api/superadmin")]
[Authorize(Roles = "superadmin")]
public class SuperAdminController : ControllerBase
{
    private readonly AppDbContext _db;
    public SuperAdminController(AppDbContext db) => _db = db;

    // Tüm binaları listele
    [HttpGet("tenants")]
    public async Task<IActionResult> GetTenants()
    {
        var tenants = await _db.Tenants
            .Include(t => t.Users)
            .Select(t => new TenantResponse(
                t.Id, t.Name, t.Slug,
                t.Domain.Length > 0 ? t.Domain : $"{t.Slug}.bizimsite.com",
                t.Address, t.Phone, t.IsActive, t.PlanType,
                t.CreatedAt, t.ExpiresAt,
                t.Users.Count
            )).ToListAsync();
        return Ok(tenants);
    }

    // Yeni bina + admin oluştur
    [HttpPost("tenants")]
    public async Task<IActionResult> CreateTenant(CreateTenantRequest req)
    {
        if (await _db.Tenants.AnyAsync(t => t.Slug == req.Slug))
            return BadRequest(new { message = "Bu slug zaten kullanımda" });

        if (await _db.Users.AnyAsync(u => u.Email == req.AdminEmail))
            return BadRequest(new { message = "Bu e-posta zaten kayıtlı" });

        var tenant = new Tenant
        {
            Name = req.Name,
            Slug = req.Slug,
            Domain = $"{req.Slug}.bizimsite.com",
            Address = req.Address,
            Phone = req.Phone,
            PlanType = req.PlanType,
            BuildingPassword = req.BuildingPassword,
            IsActive = true
        };
        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();

        // Bina admini oluştur
        var admin = new User
        {
            Name = req.AdminName,
            Email = req.AdminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.AdminPassword),
            Role = "admin",
            IsMainAdmin = true,
            TenantId = tenant.Id,
            Block = "-",
            No = "-"
        };
        _db.Users.Add(admin);

        // Varsayılan AidatConfig oluştur
        _db.AidatConfigs.Add(new AidatConfig
        {
            TenantId = tenant.Id,
            DueDay = 1,
            CurrentMonth = DateTime.UtcNow.ToString("MMMM yyyy"),
            Amount = 0
        });

        await _db.SaveChangesAsync();

        return Ok(new {
            message = "Bina ve yönetici oluşturuldu",
            tenantId = tenant.Id,
            domain = tenant.Domain
        });
    }

    // Bina güncelle (aktif/pasif, plan)
    [HttpPut("tenants/{id}")]
    public async Task<IActionResult> UpdateTenant(int id, UpdateTenantRequest req)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound();
        tenant.Name = req.Name;
        tenant.Address = req.Address;
        tenant.Phone = req.Phone;
        tenant.IsActive = req.IsActive;
        tenant.PlanType = req.PlanType;
        tenant.ExpiresAt = req.ExpiresAt;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Güncellendi" });
    }

    // Bina sil
    [HttpDelete("tenants/{id}")]
    public async Task<IActionResult> DeleteTenant(int id)
    {
        var tenant = await _db.Tenants.FindAsync(id);
        if (tenant == null) return NotFound();
        _db.Tenants.Remove(tenant);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Silindi" });
    }

    // Belirli bir binanın kullanıcılarını gör
    [HttpGet("tenants/{id}/users")]
    public async Task<IActionResult> GetTenantUsers(int id)
    {
        var users = await _db.Users
            .Where(u => u.TenantId == id)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Block, u.No, u.Role, u.Type, u.Paid, u.LastPayment, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    // Dashboard: özet istatistikler
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalTenants = await _db.Tenants.CountAsync();
        var activeTenants = await _db.Tenants.CountAsync(t => t.IsActive);
        var totalUsers = await _db.Users.CountAsync(u => u.TenantId != null);
        var totalPayments = await _db.Payments.SumAsync(p => (decimal?)p.Amount) ?? 0;

        var tenantStats = await _db.Tenants
            .Include(t => t.Users)
            .Select(t => new {
                t.Id, t.Name, t.Slug, t.IsActive, t.PlanType,
                UserCount = t.Users.Count,
                PaidCount = t.Users.Count(u => u.Paid)
            }).ToListAsync();

        return Ok(new { totalTenants, activeTenants, totalUsers, totalPayments, tenantStats });
    }

    // Tüm kullanıcıları listele (tüm binalar dahil)
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.Users
            .Include(u => u.Tenant)
            .Where(u => !u.IsSuperAdmin)
            .OrderBy(u => u.TenantId).ThenBy(u => u.Name)
            .Select(u => new SuperAdminUserResponse(
                u.Id, u.Name, u.Email, u.Phone ?? "", u.Block ?? "", u.No ?? "",
                u.Role, u.Type ?? "", u.Paid, u.CreatedAt,
                u.TenantId, u.Tenant != null ? u.Tenant.Name : "—"
            )).ToListAsync();
        return Ok(users);
    }

    // Kullanıcı şifresini sıfırla
    [HttpPut("users/{id}/reset-password")]
    public async Task<IActionResult> ResetUserPassword(int id, ResetPasswordRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 4)
            return BadRequest(new { message = "Şifre en az 4 karakter olmalı" });
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Şifre güncellendi" });
    }

    // SuperAdmin seed
    [HttpPost("seed")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedSuperAdmin()
    {
        if (await _db.Users.AnyAsync(u => u.IsSuperAdmin))
            return BadRequest(new { message = "SuperAdmin zaten mevcut" });

        var sa = new User
        {
            Name = "Süper Yönetici",
            Email = "superadmin@bizimsite.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("super123"),
            Role = "superadmin",
            IsSuperAdmin = true,
            TenantId = null,
            Block = "-",
            No = "-"
        };
        _db.Users.Add(sa);
        await _db.SaveChangesAsync();
        return Ok(new { message = "SuperAdmin oluşturuldu", email = sa.Email, password = "super123" });
    }
}
