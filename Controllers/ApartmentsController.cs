using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using BizimSite.Data;
using BizimSite.Models;

namespace BizimSite.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApartmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/apartments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Apartment>>> GetApartments()
    {
        return await _context.Apartments.Where(a => a.Aktif).ToListAsync();
    }

    // GET: api/apartments/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Apartment>> GetApartment(int id)
    {
        var apartment = await _context.Apartments.FindAsync(id);

        if (apartment == null)
        {
            return NotFound();
        }

        return apartment;
    }

    // POST: api/apartments
    [HttpPost]
    public async Task<ActionResult<Apartment>> CreateApartment(Apartment apartment)
    {
        // Check if apartment number already exists
        var existing = await _context.Apartments
            .FirstOrDefaultAsync(a => a.DaireNo == apartment.DaireNo && a.Blok == apartment.Blok);
        
        if (existing != null)
        {
            return BadRequest(new { message = "Bu daire numarası zaten mevcut." });
        }

        apartment.OlusturmaTarihi = DateTime.Now;
        _context.Apartments.Add(apartment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetApartment), new { id = apartment.Id }, apartment);
    }

    // PUT: api/apartments/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateApartment(int id, Apartment apartment)
    {
        if (id != apartment.Id)
        {
            return BadRequest();
        }

        var existingApartment = await _context.Apartments.FindAsync(id);
        if (existingApartment == null)
        {
            return NotFound();
        }

        existingApartment.DaireNo = apartment.DaireNo;
        existingApartment.Blok = apartment.Blok;
        existingApartment.Kat = apartment.Kat;
        existingApartment.SahipAdi = apartment.SahipAdi;
        existingApartment.SahipTel = apartment.SahipTel;
        existingApartment.Email = apartment.Email;
        existingApartment.Aktif = apartment.Aktif;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ApartmentExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/apartments/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteApartment(int id)
    {
        var apartment = await _context.Apartments.FindAsync(id);
        if (apartment == null)
        {
            return NotFound();
        }

        // Soft delete - just mark as inactive
        apartment.Aktif = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/apartments/import
    [HttpPost("import")]
    public async Task<IActionResult> ImportFromExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Lütfen bir Excel dosyası seçin." });
        }

        var allowedExtensions = new[] { ".xlsx", ".xls" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new { message = "Sadece Excel dosyaları (.xlsx, .xls) kabul edilir." });
        }

        try
        {
            var apartments = new List<Apartment>();
            var errors = new List<string>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                    {
                        return BadRequest(new { message = "Excel dosyasında çalışma sayfası bulunamadı." });
                    }

                    var rowCount = worksheet.Dimension.Rows;
                    
                    // Expected columns: DaireNo, Blok, Kat, SahipAdi, SahipTel, Email
                    for (int row = 2; row <= rowCount; row++) // Start from row 2 (assuming row 1 is header)
                    {
                        try
                        {
                            var daireNo = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                            var blok = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                            var katStr = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                            var sahipAdi = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                            var sahipTel = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                            var email = worksheet.Cells[row, 6].Value?.ToString()?.Trim();

                            if (string.IsNullOrWhiteSpace(daireNo))
                            {
                                errors.Add($"Satır {row}: Daire numarası boş.");
                                continue;
                            }

                            if (string.IsNullOrWhiteSpace(sahipAdi))
                            {
                                errors.Add($"Satır {row}: Sahip adı boş.");
                                continue;
                            }

                            int kat = 0;
                            if (!string.IsNullOrWhiteSpace(katStr) && !int.TryParse(katStr, out kat))
                            {
                                errors.Add($"Satır {row}: Kat bilgisi sayısal değil.");
                                continue;
                            }

                            // Check if apartment already exists
                            var existing = await _context.Apartments
                                .FirstOrDefaultAsync(a => a.DaireNo == daireNo && a.Blok == blok);

                            if (existing != null)
                            {
                                // Update existing
                                existing.SahipAdi = sahipAdi;
                                existing.SahipTel = sahipTel;
                                existing.Email = email;
                                existing.Kat = kat;
                            }
                            else
                            {
                                // Add new
                                apartments.Add(new Apartment
                                {
                                    DaireNo = daireNo,
                                    Blok = blok,
                                    Kat = kat,
                                    SahipAdi = sahipAdi,
                                    SahipTel = sahipTel,
                                    Email = email,
                                    Aktif = true,
                                    OlusturmaTarihi = DateTime.Now
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"Satır {row}: {ex.Message}");
                        }
                    }
                }
            }

            if (apartments.Any())
            {
                _context.Apartments.AddRange(apartments);
                await _context.SaveChangesAsync();
            }

            var result = new
            {
                SuccessCount = apartments.Count,
                ErrorCount = errors.Count,
                Errors = errors,
                Message = $"{apartments.Count} daire başarıyla içe aktarıldı. {errors.Count} hata oluştu."
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Excel okuma hatası: {ex.Message}" });
        }
    }

    private bool ApartmentExists(int id)
    {
        return _context.Apartments.Any(e => e.Id == id);
    }
}

