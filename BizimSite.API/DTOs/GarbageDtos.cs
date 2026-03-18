namespace BizimSite.API.DTOs;
public record GarbageResponse(int Id, string UserName, string Block, string No, bool IsReady, DateTime MarkedAt, DateTime? CollectedAt);
