namespace BizimSite.API.DTOs;
public record UserResponse(int Id, string Name, string Email, string Phone, string Block, string No, string Role, string Type, bool Paid, string? LastPayment, DateTime CreatedAt);
public record UpdateUserRequest(string Name, string Email, string? Password, string Phone, string Block, string No, string Role, string Type);
