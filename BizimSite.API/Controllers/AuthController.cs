using BizimSite.API.Data;
using BizimSite.API.DTOs;
using BizimSite.API.Models;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BizimSite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, JwtService jwt, IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _db = db; _jwt = jwt; _httpClientFactory = httpClientFactory; _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "E-posta veya şifre hatalı" });

        if (user.TenantId != null && user.Tenant?.IsActive == false)
            return Unauthorized(new { message = "Aboneliğiniz aktif değil" });

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

    // E-posta doğrulama kodu gönder
    [HttpPost("send-code")]
    [AllowAnonymous]
    public async Task<IActionResult> SendCode(SendCodeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || !req.Email.Contains('@'))
            return BadRequest(new { message = "Geçersiz e-posta adresi" });

        // Eski kodları temizle
        var old = await _db.VerificationCodes.Where(v => v.Email == req.Email).ToListAsync();
        _db.VerificationCodes.RemoveRange(old);

        var code = new Random().Next(100000, 999999).ToString();
        _db.VerificationCodes.Add(new VerificationCode
        {
            Email = req.Email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });
        await _db.SaveChangesAsync();

        // E-posta gönder (Resend API)
        var apiKey = _config["Resend:ApiKey"];
        var fromEmail = _config["Resend:FromEmail"] ?? "BizimSite <onboarding@resend.dev>";

        if (string.IsNullOrEmpty(apiKey))
            return BadRequest(new { message = "E-posta servisi yapılandırılmamış. Lütfen yönetici ile iletişime geçin." });

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var body = new
        {
            from = fromEmail,
            to = new[] { req.Email },
            subject = "BizimSite — E-posta Doğrulama Kodunuz",
            html = $@"
                <div style='font-family:sans-serif;max-width:480px;margin:auto'>
                  <h2 style='color:#3B82F6'>BizimSite E-posta Doğrulama</h2>
                  <p>Kayıt işleminizi tamamlamak için aşağıdaki doğrulama kodunu kullanın:</p>
                  <div style='background:#F0F9FF;border:2px solid #BAE6FD;border-radius:12px;padding:24px;text-align:center;margin:24px 0'>
                    <span style='font-size:36px;font-weight:bold;letter-spacing:8px;color:#0369A1'>{code}</span>
                  </div>
                  <p style='color:#64748B;font-size:13px'>Bu kod 10 dakika geçerlidir. Kodu kimseyle paylaşmayın.</p>
                </div>"
        };

        var response = await client.PostAsync(
            "https://api.resend.com/emails",
            new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            return StatusCode(500, new { message = "E-posta gönderilemedi. Lütfen tekrar deneyin.", detail = err });
        }

        return Ok(new { message = "Doğrulama kodu e-posta adresinize gönderildi." });
    }

    // Kodu doğrula + hesap oluştur
    [HttpPost("self-register")]
    [AllowAnonymous]
    public async Task<IActionResult> SelfRegister(SelfRegisterRequest req)
    {
        // Doğrulama kodunu kontrol et
        var vc = await _db.VerificationCodes
            .Where(v => v.Email == req.Email && v.Code == req.VerificationCode && !v.Used)
            .OrderByDescending(v => v.CreatedAt)
            .FirstOrDefaultAsync();

        if (vc == null)
            return BadRequest(new { message = "Doğrulama kodu hatalı" });

        if (vc.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Doğrulama kodunun süresi dolmuş. Yeni kod isteyin." });

        var tenant = await _db.Tenants.FirstOrDefaultAsync(t =>
            t.Name == req.BuildingName &&
            t.BuildingPassword == req.BuildingPassword &&
            t.IsActive);

        if (tenant == null)
            return BadRequest(new { message = "Bina adı veya bina şifresi hatalı" });

        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "Bu e-posta adresi zaten kayıtlı" });

        var user = new User
        {
            Name = req.Name,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = "resident",
            Type = req.UserType,
            Phone = req.Phone ?? string.Empty,
            Block = req.Block ?? string.Empty,
            No = req.No ?? string.Empty,
            TenantId = tenant.Id
        };
        _db.Users.Add(user);

        vc.Used = true; // Kodu kullanıldı olarak işaretle
        await _db.SaveChangesAsync();

        return Ok(new { message = "Kayıt başarılı! Giriş yapabilirsiniz." });
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
