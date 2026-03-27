namespace BizimSite.API.Models;
public class AidatConfig
{
    public int Id { get; set; }
    public int DueDay { get; set; } = 1;
    public string CurrentMonth { get; set; } = string.Empty;
    public decimal Amount { get; set; } = 0;
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Dönem tarihleri
    public DateTime? PeriodStartDate { get; set; }
    public DateTime? PeriodEndDate { get; set; }

    // Geri alma için önceki dönem bilgileri
    public string? PreviousMonth { get; set; }
    public DateTime? PreviousStartDate { get; set; }
    public DateTime? PreviousEndDate { get; set; }

    // Ödeme bilgileri
    public string IbanNo { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
}
