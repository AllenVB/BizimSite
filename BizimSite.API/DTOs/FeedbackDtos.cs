namespace BizimSite.API.DTOs;

public record FeedbackRequest(string Title, string Message, string Type);
public record FeedbackStatusRequest(string Status);
public record FeedbackResponse(int Id, string Title, string Message, string Type,
    string Status, string SenderName, string SenderRole, string? TenantName, DateTime CreatedAt);
