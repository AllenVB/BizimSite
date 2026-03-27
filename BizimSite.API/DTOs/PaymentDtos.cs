namespace BizimSite.API.DTOs;
public record PaymentRequest(decimal Amount, string Description, string? DekontUrl, string? DekontNote);
public record PaymentResponse(int Id, int UserId, string UserName, string Block, string No, decimal Amount, string Description, string Status, DateTime PaidAt, string? DekontUrl, string? DekontNote, string? AdminNote);
public record PaymentStatusRequest(string Status, string? AdminNote);
