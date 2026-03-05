using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizimSite.Models;

public enum ExpenseCategory
{
    Temizlik,
    Bakim,
    Sigorta,
    Elektrik,
    Su,
    Dogalgaz,
    Asansor,
    Guvenlik,
    Peyzaj,
    Diger
}

public class Expense
{
    public int Id { get; set; }
    
    [Required]
    public ExpenseCategory Kategori { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Tutar { get; set; }
    
    [Required]
    [StringLength(500)]
    public string Aciklama { get; set; } = string.Empty;
    
    [Required]
    public DateTime Tarih { get; set; }
    
    [StringLength(100)]
    public string? Firma { get; set; } // Hizmet alınan firma
    
    [StringLength(20)]
    public string? FaturaNo { get; set; }
    
    public DateTime OlusturmaTarihi { get; set; } = DateTime.Now;
    
    // Navigation property
    public int? OlusturanKullaniciId { get; set; }
    public virtual User? OlusturanKullanici { get; set; }
}

