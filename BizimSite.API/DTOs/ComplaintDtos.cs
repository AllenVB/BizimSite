namespace BizimSite.API.DTOs;
public record ComplaintRequest(string Title, string Description, bool IsAnonymous);
public record ComplaintUpdateRequest(string Status, string? AdminNote);
public record ComplaintResponse(int Id, string Title, string Description, string Status, bool IsAnonymous, string UserName, string UserBlock, string UserNo, string? AdminNote, DateTime CreatedAt);
