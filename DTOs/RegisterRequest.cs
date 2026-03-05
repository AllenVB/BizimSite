using System.ComponentModel.DataAnnotations;

namespace BizimSite.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Ad zorunludur")]
    [StringLength(50)]
    public string Ad { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad zorunludur")]
    [StringLength(50)]
    public string Soyad { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email zorunludur")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi girin")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    public string Sifre { get; set; } = string.Empty;

    [Required]
    [Compare("Sifre", ErrorMessage = "Şifreler eşleşmiyor")]
    public string SifreOnay { get; set; } = string.Empty;
}
