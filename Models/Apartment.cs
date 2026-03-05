using System.ComponentModel.DataAnnotations;

namespace BizimSite.Models;

public class Apartment
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(10)]
    public string DaireNo { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Blok { get; set; }
    
    public int Kat { get; set; }
    
    [Required]
    [StringLength(100)]
    public string SahipAdi { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? SahipTel { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public bool Aktif { get; set; } = true;
    
    public DateTime OlusturmaTarihi { get; set; } = DateTime.Now;
    
    // Navigation properties
    public virtual ICollection<Due> Aidatlar { get; set; } = new List<Due>();
    public virtual ICollection<User> Sakinler { get; set; } = new List<User>();
}

