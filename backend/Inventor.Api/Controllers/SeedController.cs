using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.Entities;
using Inventor.Api.Models.Enums;
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
    public class SeedController : ControllerBase
    {
        private readonly InventoryDbContext _context;
        private readonly ITenantProvider _tenantProvider;

        public SeedController(InventoryDbContext context, ITenantProvider tenantProvider)
        {
            _context = context;
            _tenantProvider = tenantProvider;
        }

        [HttpPost("all")]
        public async Task<IActionResult> SeedAll(string tenantId)
        {
            // Ensure we have a tenant context
            //var tenantId = "tenant-1";
            _tenantProvider.SetTenantId(tenantId);

            // 1. Clear existing data for this tenant (optional, but good for idempotent seeding)
            // Note: Global filters apply, so we only see tenant-1 data
            _context.InventoryLedgers.RemoveRange(_context.InventoryLedgers);
            _context.ProcessExecutionIOs.RemoveRange(_context.ProcessExecutionIOs);
            _context.ProcessExecutions.RemoveRange(_context.ProcessExecutions);
            _context.ProcessIODefinitions.RemoveRange(_context.ProcessIODefinitions);
            _context.ProcessCostDefinitions.RemoveRange(_context.ProcessCostDefinitions);
            _context.ProcessDefinitionVersions.RemoveRange(_context.ProcessDefinitionVersions);
            _context.ProcessDefinitions.RemoveRange(_context.ProcessDefinitions);
            _context.Products.RemoveRange(_context.Products);
            
            await _context.SaveChangesAsync();

            // 2. Seed Products
            var fabric = new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Code = "RAW-FAB-001",
                Name = "Cotton Fabric",
                ProductType = ProductType.RAW,
                UOM = "Meters",
                CurrentQuantity = 0
            };

            var thread = new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Code = "RAW-THR-001",
                Name = "Nylon Thread",
                ProductType = ProductType.RAW,
                UOM = "Spools",
                CurrentQuantity = 0
            };

            var tshirt = new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Code = "FG-TSH-001",
                Name = "White T-Shirt",
                ProductType = ProductType.FG,
                UOM = "Pcs",
                CurrentQuantity = 0
            };

            _context.Products.AddRange(fabric, thread, tshirt);

            // 3. Seed Initial Inventory (Ledger Entries)
            var fabricIn = new InventoryLedger
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ProductId = fabric.Id,
                Direction = LedgerDirection.IN,
                Quantity = 500,
                UOM = fabric.UOM,
                UnitCost = 10,
                TotalCost = 5000,
                EventType = "INITIAL_STOCK",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };

            var threadIn = new InventoryLedger
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ProductId = thread.Id,
                Direction = LedgerDirection.IN,
                Quantity = 50,
                UOM = thread.UOM,
                UnitCost = 2,
                TotalCost = 100,
                EventType = "INITIAL_STOCK",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };

            _context.InventoryLedgers.AddRange(fabricIn, threadIn);
            
            // Update cached quantities
            fabric.CurrentQuantity = 500;
            thread.CurrentQuantity = 50;

            // 4. Seed Process Definition (BOM/Recipe)
            var definition = new ProcessDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "T-Shirt Manufacturing",
                Description = "Standard production of white cotton t-shirts"
            };

            var version = new ProcessDefinitionVersion
            {
                Id = Guid.NewGuid(),
                ProcessDefinitionId = definition.Id,
                VersionNumber = 1,
                Status = VersionStatus.ACTIVE,
                EffectiveFrom = DateTime.UtcNow.AddDays(-10),
                IOs = new List<ProcessIODefinition>
                {
                    new ProcessIODefinition 
                    { 
                        Id = Guid.NewGuid(), 
                        ProductId = fabric.Id, 
                        Direction = IODirection.IN, 
                        StandardQty = 1.5m, 
                        UOM = fabric.UOM 
                    },
                    new ProcessIODefinition 
                    { 
                        Id = Guid.NewGuid(), 
                        ProductId = thread.Id, 
                        Direction = IODirection.IN, 
                        StandardQty = 0.1m, 
                        UOM = thread.UOM 
                    },
                    new ProcessIODefinition 
                    { 
                        Id = Guid.NewGuid(), 
                        ProductId = tshirt.Id, 
                        Direction = IODirection.OUT, 
                        StandardQty = 1, 
                        UOM = tshirt.UOM 
                    }
                },
                Costs = new List<ProcessCostDefinition>
                {
                    new ProcessCostDefinition { Id = Guid.NewGuid(), CostType = CostType.LABOR, Rate = 5 },
                    new ProcessCostDefinition { Id = Guid.NewGuid(), CostType = CostType.OVERHEAD, Rate = 2 }
                }
            };

            _context.ProcessDefinitions.Add(definition);
            _context.ProcessDefinitionVersions.Add(version);

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Data seeded successfully for tenant-1." });
        }
    }
}
