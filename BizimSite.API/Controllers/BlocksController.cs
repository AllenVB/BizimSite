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
public class BlocksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TenantContext _tenant;
    public BlocksController(AppDbContext db, TenantContext tenant) { _db = db; _tenant = tenant; }

    private int GetTenantId()
    {
        if (_tenant.TenantId.HasValue) return _tenant.TenantId.Value;
        var claim = HttpContext.User.FindFirst("tenantId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = GetTenantId();
        var blocks = await _db.Blocks
            .Where(b => b.TenantId == tenantId)
            .OrderBy(b => b.Name)
            .ToListAsync();
        return Ok(blocks);
    }

    [HttpPost]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Create([FromBody] BlockDto req)
    {
        var tenantId = GetTenantId();
        var block = new Block
        {
            Name = req.Name,
            Floors = req.Floors,
            ApartmentsPerFloor = req.ApartmentsPerFloor,
            TotalApartments = req.Floors * req.ApartmentsPerFloor,
            TenantId = tenantId
        };
        _db.Blocks.Add(block);
        await _db.SaveChangesAsync();
        return Ok(block);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Update(int id, [FromBody] BlockDto req)
    {
        var block = await _db.Blocks.FindAsync(id);
        if (block == null) return NotFound();
        block.Name = req.Name;
        block.Floors = req.Floors;
        block.ApartmentsPerFloor = req.ApartmentsPerFloor;
        block.TotalApartments = req.Floors * req.ApartmentsPerFloor;
        await _db.SaveChangesAsync();
        return Ok(block);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var block = await _db.Blocks.FindAsync(id);
        if (block == null) return NotFound();
        _db.Blocks.Remove(block);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Silindi" });
    }
}
