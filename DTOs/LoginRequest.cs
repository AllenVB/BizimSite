using System.ComponentModel.DataAnnotations;

namespace BizimSite.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "Email zorunludur")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi girin")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur")]
    public string Sifre { get; set; } = string.Empty;
}
