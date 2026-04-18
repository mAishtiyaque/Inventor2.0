using Inventor.Api.Data;
using Inventor.Api.Models.Entities;
using Inventor.Api.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Inventor.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly InventoryDbContext _context;

        public InventoryController(InventoryDbContext context)
        {
            _context = context;
        }

        [HttpGet("ledger")]
        public async Task<ActionResult<IEnumerable<LedgerEntryDto>>> GetLedger()
        {
            var ledger = await _context.InventoryLedgers
                .Include(l => l.Product)
                .Select(l => new LedgerEntryDto
                {
                    Id = l.Id,
                    ProductId = l.ProductId,
                    ProductName = l.Product != null ? l.Product.Name : null,
                    Direction = l.Direction,
                    Quantity = l.Quantity,
                    UOM = l.UOM,
                    UnitCost = l.UnitCost,
                    TotalCost = l.TotalCost,
                    EventType = l.EventType,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return Ok(ledger);
        }

        [HttpPost("ledger")]
        public async Task<ActionResult<LedgerEntryDto>> CreateLedgerEntry(CreateLedgerEntryRequest request)
        {
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null) return NotFound("Product not found.");

            var entry = new InventoryLedger
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                Direction = request.Direction,
                Quantity = request.Quantity,
                UOM = product.UOM,
                UnitCost = request.UnitCost,
                TotalCost = (double)request.Quantity * request.UnitCost,
                EventType = request.EventType,
                CreatedAt = DateTime.UtcNow,
                TenantId = "" // Handled by SaveChanges
            };

            // Update product current quantity (simplistic for Phase 1)
            if (entry.Direction == Models.Enums.LedgerDirection.IN)
                product.CurrentQuantity += entry.Quantity;
            else
                product.CurrentQuantity -= entry.Quantity;

            _context.InventoryLedgers.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(new LedgerEntryDto
            {
                Id = entry.Id,
                ProductId = entry.ProductId,
                ProductName = product.Name,
                Direction = entry.Direction,
                Quantity = entry.Quantity,
                UOM = entry.UOM,
                UnitCost = entry.UnitCost,
                TotalCost = entry.TotalCost,
                EventType = entry.EventType,
                CreatedAt = entry.CreatedAt
            });
        }
    }
}
