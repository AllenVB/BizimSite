namespace BizimSite.API.DTOs;
public record BlockDto(string Name, int Floors, int ApartmentsPerFloor);
public record NewMonthRequest(string MonthName, DateTime? StartDate, DateTime? EndDate);
