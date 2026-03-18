namespace BizimSite.API.DTOs;
public record ExpenseRequest(string Category, string Label, decimal Amount);
public record ExpenseResponse(int Id, string Category, string Label, decimal Amount, DateTime CreatedAt);
