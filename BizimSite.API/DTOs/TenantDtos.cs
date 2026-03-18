namespace BizimSite.API.DTOs;

public record CreateTenantRequest(
    string Name,
    string Slug,
    string Address,
    string Phone,
    string PlanType,
    // İlk admin bilgileri
    string AdminName,
    string AdminEmail,
    string AdminPassword
);

public record TenantResponse(
    int Id,
    string Name,
    string Slug,
    string Domain,
    string Address,
    string Phone,
    bool IsActive,
    string PlanType,
    DateTime CreatedAt,
    DateTime? ExpiresAt,
    int UserCount
);

public record UpdateTenantRequest(
    string Name,
    string Address,
    string Phone,
    bool IsActive,
    string PlanType,
    DateTime? ExpiresAt
);
