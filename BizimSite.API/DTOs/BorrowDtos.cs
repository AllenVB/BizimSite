namespace BizimSite.API.DTOs;
public record BorrowRequestDto(string ItemName, string? Description, string? Duration);
public record BorrowResponseDto(string ResponseType);
public record BorrowRequestResponse(int Id, int UserId, string ItemName, string Description, string Duration, string Status, string UserName, string Block, string No, DateTime CreatedAt, List<BorrowResponseItem> Responses);
public record BorrowResponseItem(int Id, int UserId, string UserName, string ResponseType, DateTime CreatedAt);
