using BizimSite.API.Data;
using BizimSite.API.DTOs;
using BizimSite.API.Models;
using BizimSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizimSite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public ExpensesController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var tenantClaim = HttpContext.User.FindFirst("tenantId")?.Value;
        return int.TryParse(tenantClaim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Expenses.Where(e => e.TenantId == GetTenantId())
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new ExpenseResponse(e.Id, e.Category, e.Label, e.Amount, e.CreatedAt)).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create(ExpenseRequest req)
    {
        var e = new Expense { Category = req.Category, Label = req.Label, Amount = req.Amount, TenantId = GetTenantId() };
        _db.Expenses.Add(e);
        await _db.SaveChangesAsync();
        return Ok(new ExpenseResponse(e.Id, e.Category, e.Label, e.Amount, e.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _db.Expenses.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == GetTenantId());
        if (e == null) return NotFound();
        _db.Expenses.Remove(e);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Silindi" });
    }
}
