namespace BizimSite.API.DTOs;
public record PaymentRequest(decimal Amount, string Description);
public record PaymentResponse(int Id, string UserName, string Block, string No, decimal Amount, string Description, string Status, DateTime PaidAt);
