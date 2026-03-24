using BizimSite.API.Data;
using BizimSite.API.DTOs;
using BizimSite.API.Filters;
using BizimSite.API.Models;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace BizimSite.API.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
[PlanRequired("premium")]
public class BorrowController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public BorrowController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (_tenant.TenantId == null) return Ok(new List<object>());
        var list = await _db.BorrowRequests
            .Where(b => b.TenantId == _tenant.TenantId)
            .Include(b => b.User).Include(b => b.Responses).ThenInclude(r => r.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BorrowRequestResponse(
                b.Id, b.UserId, b.ItemName, b.Description, b.Duration, b.Status,
                b.User != null ? b.User.Name : "", b.User != null ? b.User.Block : "", b.User != null ? b.User.No : "",
                b.CreatedAt,
                b.Responses.Select(r => new BorrowResponseItem(r.Id, r.UserId, r.User != null ? r.User.Name : "", r.ResponseType, r.CreatedAt)).ToList()
            )).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create(BorrowRequestDto req)
    {
        if (_tenant.TenantId == null) return BadRequest(new { message = "Tenant bulunamadı." });
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var b = new BorrowRequest
        {
            UserId = userId,
            TenantId = _tenant.TenantId.Value,
            ItemName = req.ItemName,
            Description = req.Description ?? "",
            Duration = req.Duration ?? "Belirsiz"
        };
        _db.BorrowRequests.Add(b);
        await _db.SaveChangesAsync();
        return Ok(new { b.Id });
    }

    [HttpPost("{id}/respond")]
    public async Task<IActionResult> Respond(int id, BorrowResponseDto req)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var r = new BorrowResponse { BorrowRequestId = id, UserId = userId, ResponseType = req.ResponseType };
        _db.BorrowResponses.Add(r);
        await _db.SaveChangesAsync();
        return Ok(new { r.Id });
    }
}
