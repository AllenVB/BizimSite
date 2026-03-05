using System.ComponentModel.DataAnnotations;

namespace BizimSite.Models;

public class Announcement
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Baslik { get; set; } = string.Empty;
    
    [Required]
    public string Icerik { get; set; } = string.Empty;
    
    public DateTime YayinTarihi { get; set; } = DateTime.Now;
    
    public DateTime? BitisTarihi { get; set; }
    
    public bool Aktif { get; set; } = true;
    
    public bool Oncelikli { get; set; } = false; // Önemli duyurular için
    
    // Duyuruyu oluşturan yönetici
    public int? OlusturanKullaniciId { get; set; }
    
    // Navigation property
    public virtual User? OlusturanKullanici { get; set; }
}

