using System.ComponentModel.DataAnnotations;
namespace BizimSite.API.Models;
public class Tenant
{
    public int Id { get; set; }
    [Required] public string Name { get; set; } = string.Empty;   // Güneş Apartmanı
    [Required] public string Slug { get; set; } = string.Empty;   // gunesapt
    public string Domain { get; set; } = string.Empty;            // gunesapt.bizimsite.com
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string BuildingPassword { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string PlanType { get; set; } = "basic";               // basic | premium
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}
