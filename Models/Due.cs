using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizimSite.Models;

public class Due
{
    public int Id { get; set; }
    
    [Required]
    public int DaireId { get; set; }
    
    [Required]
    public int Yil { get; set; }
    
    [Required]
    public int Ay { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Tutar { get; set; }
    
    public bool Odendi { get; set; } = false;
    
    public DateTime? OdemeTarihi { get; set; }
    
    [StringLength(20)]
    public string? OdemeSekli { get; set; } // Nakit, Banka, Kredi Kartı
    
    [StringLength(500)]
    public string? Aciklama { get; set; }
    
    public DateTime OlusturmaTarihi { get; set; } = DateTime.Now;
    
    // Navigation property
    [ForeignKey("DaireId")]
    public virtual Apartment? Daire { get; set; }
}

