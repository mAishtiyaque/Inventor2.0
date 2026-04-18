using System;
using System.Threading.Tasks;
using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.Entities;
using Inventor.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Inventor.Api.Services
{
    public class LedgerService : ILedgerService
    {
        private readonly InventoryDbContext _context;

        public LedgerService(InventoryDbContext context)
        {
            _context = context;
        }

        public async Task CreateEntryAsync(Guid productId, decimal quantity, string uom, string direction, string eventType, double unitCost = 0, Guid? executionId = null)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new Exception("Product not found");

            var ledgerEntry = new InventoryLedger
            {
                Id = Guid.NewGuid(),
                TenantId = "", // Handled by SaveChanges
                ProductId = productId,
                ProcessExecutionId = executionId,
                Direction = direction == "IN" ? LedgerDirection.IN : LedgerDirection.OUT,
                Quantity = quantity,
                UOM = uom,
                UnitCost = unitCost,
                TotalCost = unitCost * (double)quantity,
                EventType = eventType,
                CreatedAt = DateTime.UtcNow
            };

            _context.InventoryLedgers.Add(ledgerEntry);

            // Update product cache (CurrentQuantity)
            if (ledgerEntry.Direction == LedgerDirection.IN)
                product.CurrentQuantity += quantity;
            else
                product.CurrentQuantity -= quantity;
        }
    }
}
