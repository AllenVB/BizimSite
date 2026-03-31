namespace BizimSite.API.DTOs;
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, int Id, string Name, string Email, string Role, bool IsMainAdmin, string Block, string No, bool Paid);
public record RegisterRequest(string Name, string Email, string Password, string Phone, string Block, string No, string Role, string Type);
public record SelfRegisterRequest(string BuildingName, string BuildingPassword, string Name, string Email, string Password, string UserType, string VerificationCode, string Phone, string Block, string No);
public record SendCodeRequest(string Email);
