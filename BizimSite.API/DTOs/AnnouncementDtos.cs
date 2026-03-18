namespace BizimSite.API.DTOs;
public record AnnouncementRequest(string Title, string Content);
public record AnnouncementResponse(int Id, string Title, string Content, string Author, string AuthorRole, DateTime CreatedAt);
