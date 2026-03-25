namespace BizimSite.API.DTOs;
public record GarbageResponse(int Id, int UserId, string UserName, string Block, string No, bool IsReady, bool IsCollected, DateTime MarkedAt, DateTime? CollectedAt);
