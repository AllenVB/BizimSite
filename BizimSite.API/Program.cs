using BizimSite.API.Data;
using BizimSite.API.Middleware;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true,
            ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<TenantContext>(); // Her istek için ayrı instance
builder.Services.AddControllers();
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:3000")
     .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // SuperAdmin seed — her zaman sabit e-posta/şifre
    const string superEmail = "superadmin@bizimsite.com";
    const string superPassword = "BizimSite2026!";
    var existing = db.Users.FirstOrDefault(u => u.IsSuperAdmin);
    if (existing == null)
    {
        db.Users.Add(new BizimSite.API.Models.User
        {
            Name = "Süper Yönetici",
            Email = superEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(superPassword),
            Role = "superadmin",
            IsSuperAdmin = true
        });
        db.SaveChanges();
    }
    else
    {
        // E-posta veya şifre değişmişse sıfırla
        existing.Email = superEmail;
        existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(superPassword);
        db.SaveChanges();
    }
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<TenantMiddleware>(); // Tenant tespiti
app.MapControllers();
app.Run();
