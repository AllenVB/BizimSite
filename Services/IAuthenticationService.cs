using BizimSite.Models;

namespace BizimSite.Services;

public interface IAuthenticationService
{
    string GenerateJwtToken(User user);
    bool VerifyPassword(string password, string hash);
    string HashPassword(string password);
}
