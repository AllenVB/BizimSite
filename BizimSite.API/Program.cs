using BizimSite.API.Data;
using BizimSite.API.Middleware;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Railway'in atadığı PORT'u dinle
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// URI formatı (postgresql://...) veya key-value formatı destekle
var rawConn = builder.Configuration.GetConnectionString("Default")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL") ?? "";

string connectionString;
if (rawConn.StartsWith("postgresql://") || rawConn.StartsWith("postgres://"))
{
    var uri = new Uri(rawConn);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connectionString = rawConn;
}

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));

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
builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.SetIsOriginAllowed(origin =>
        origin.Contains("localhost") ||
        origin.EndsWith(".vercel.app") ||
        origin.EndsWith(".railway.app") ||
        (builder.Configuration["AllowedOrigins"] ?? "").Split(",").Any(o => o.Trim() == origin)
    )
    .AllowAnyHeader()
    .AllowAnyMethod()));

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
