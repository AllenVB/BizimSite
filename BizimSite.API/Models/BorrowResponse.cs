namespace BizimSite.API.Models;
public class BorrowResponse
{
    public int Id { get; set; }
    public int BorrowRequestId { get; set; }
    public BorrowRequest? BorrowRequest { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string ResponseType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
