namespace BizimSite.API.DTOs;
public record BorrowRequestDto(string ItemName, string Description);
public record BorrowResponseDto(string ResponseType);
public record BorrowRequestResponse(int Id, string ItemName, string Description, string Status, string UserName, string Block, string No, DateTime CreatedAt, List<BorrowResponseItem> Responses);
public record BorrowResponseItem(int Id, string UserName, string ResponseType, DateTime CreatedAt);
