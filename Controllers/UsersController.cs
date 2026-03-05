using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BizimSite.Data;
using BizimSite.Models;
using BizimSite.DTOs;
using BizimSite.Services;

namespace BizimSite.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthenticationService _authService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(ApplicationDbContext context, IAuthenticationService authService, ILogger<UsersController> logger)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
    }

    // POST: api/users/register
    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register(RegisterRequest request)
    {
        try
        {
            // Validate model
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existingUser != null)
            {
                return BadRequest(new { message = "Bu email adresi zaten kayıtlı." });
            }

            // Create new user
            var user = new User
            {
                Ad = request.Ad,
                Soyad = request.Soyad,
                Email = request.Email.ToLower(),
                Sifre = _authService.HashPassword(request.Sifre),
                Rol = UserRole.Sakin, // Default role
                Aktif = true,
                OlusturmaTarihi = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate token
            var token = _authService.GenerateJwtToken(user);

            var response = new LoginResponse
            {
                Success = true,
                Message = "Kullanıcı başarıyla oluşturuldu.",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Ad = user.Ad,
                    Soyad = user.Soyad,
                    Email = user.Email,
                    Rol = user.Rol.ToString(),
                    DaireId = user.DaireId
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Kayıt hatası: {ex.Message}");
            return StatusCode(500, new { message = "Kayıt sırasında bir hata oluştu." });
        }
    }

    // POST: api/users/login
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        try
        {
            // Validate model
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || !user.Aktif)
            {
                return Unauthorized(new { message = "Email veya şifre yanlış." });
            }

            // Verify password
            if (!_authService.VerifyPassword(request.Sifre, user.Sifre))
            {
                return Unauthorized(new { message = "Email veya şifre yanlış." });
            }

            // Generate token
            var token = _authService.GenerateJwtToken(user);

            var response = new LoginResponse
            {
                Success = true,
                Message = "Giriş başarılı.",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Ad = user.Ad,
                    Soyad = user.Soyad,
                    Email = user.Email,
                    Rol = user.Rol.ToString(),
                    DaireId = user.DaireId
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Giriş hatası: {ex.Message}");
            return StatusCode(500, new { message = "Giriş sırasında bir hata oluştu." });
        }
    }

    // GET: api/users/profile
    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        try
        {
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            
            if (!int.TryParse(userId, out var id))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(id);

            if (user == null || !user.Aktif)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                Ad = user.Ad,
                Soyad = user.Soyad,
                Email = user.Email,
                Rol = user.Rol.ToString(),
                DaireId = user.DaireId
            };

            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Profil alınırken hata: {ex.Message}");
            return StatusCode(500, new { message = "Bir hata oluştu." });
        }
    }

    // PUT: api/users/profile
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(RegisterRequest request)
    {
        try
        {
            var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            
            if (!int.TryParse(userId, out var id))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(id);

            if (user == null || !user.Aktif)
            {
                return NotFound();
            }

            user.Ad = request.Ad;
            user.Soyad = request.Soyad;

            if (request.Sifre != null && request.Sifre.Length > 0)
            {
                user.Sifre = _authService.HashPassword(request.Sifre);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profil başarıyla güncellendi." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Profil güncellenirken hata: {ex.Message}");
            return StatusCode(500, new { message = "Bir hata oluştu." });
        }
    }
}
