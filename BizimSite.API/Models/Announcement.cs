using System.ComponentModel.DataAnnotations;
namespace BizimSite.API.Models;
public class Announcement
{
    public int Id { get; set; }
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string AuthorRole { get; set; } = string.Empty;
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
