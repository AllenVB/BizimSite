using System.ComponentModel.DataAnnotations;

namespace BizimSite.Models;

public enum UserRole
{
    Yonetici,
    Sakin,
    Yetkili
}

public class User
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Ad { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Soyad { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string Sifre { get; set; } = string.Empty;
    
    public UserRole Rol { get; set; } = UserRole.Sakin;
    
    public int? DaireId { get; set; }
    
    public bool Aktif { get; set; } = true;
    
    public DateTime OlusturmaTarihi { get; set; } = DateTime.Now;
    
    // Navigation property
    public virtual Apartment? Daire { get; set; }
}

