using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Inventor.Api.Services
{
    public class ReportingService : IReportingService
    {
        private readonly InventoryDbContext _context;

        public ReportingService(InventoryDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            // 1. Inventory Valuation
            var valuations = await _context.Products
                .GroupBy(p => p.ProductType)
                .Select(g => new InventoryValuationDto
                {
                    ProductType = g.Key.ToString(),
                    TotalQuantity = g.Sum(p => p.CurrentQuantity),
                    TotalValue = (decimal)g.Sum(p => (double)p.CurrentQuantity * p.Costs.Where(c => c.IsActive).Sum(c => c.Amount))
                })
                .ToListAsync();

            // 2. Efficiency
            var efficiencies = await _context.ProcessExecutions
                .Include(x => x.ProcessDefinitionVersion)
                .ThenInclude(v => v!.ProcessDefinition)
                .Where(x => x.Status == ExecutionStatus.COMPLETED)
                .OrderByDescending(x => x.CompletedAt)
                .Take(10)
                .Select(x => new ManufacturingEfficiencyDto
                {
                    ProcessName = x.ProcessDefinitionVersion!.ProcessDefinition!.Name,
                    PlannedQty = x.PlannedQty,
                    ActualQty = x.ActualOutputQty
                })
                .ToListAsync();

            // 3. Recent Activities
            var recentActivities = await _context.ProcessExecutions
                .Include(x => x.ProcessDefinitionVersion)
                .ThenInclude(v => v!.ProcessDefinition)
                .OrderByDescending(x => x.StartedAt)
                .Take(5)
                .Select(x => new RecentActivityDto
                {
                    Id = x.Id.ToString().Substring(0, 8).ToUpper(),
                    Title = $"Order for {x.ProcessDefinitionVersion!.ProcessDefinition!.Name}",
                    Description = $"{x.PlannedQty} Units planned",
                    Status = x.Status.ToString(),
                    Color = x.Status == ExecutionStatus.COMPLETED ? "emerald" : 
                            x.Status == ExecutionStatus.IN_PROGRESS ? "blue" : "orange"
                })
                .ToListAsync();

            // 4. Stock Alerts
            var stockAlerts = await _context.Products
                .Where(p => p.CurrentQuantity < 10 && p.ProductType != ProductType.SCRAP)
                .OrderBy(p => p.CurrentQuantity)
                .Take(5)
                .Select(p => new StockAlertDto
                {
                    Name = p.Name,
                    Type = p.ProductType.ToString(),
                    Recommendation = 100, // Hardcoded recommendation for now
                    Stock = p.CurrentQuantity
                })
                .ToListAsync();

            var totalJobOrders = await _context.ProcessExecutions.CountAsync();
            var finishedGoodsCount = await _context.Products
                .Where(p => p.ProductType == ProductType.FG)
                .SumAsync(p => p.CurrentQuantity);
            var rawMaterialCount = await _context.Products
                .Where(p => p.ProductType == ProductType.RAW)
                .SumAsync(p => p.CurrentQuantity);

            return new DashboardSummaryDto
            {
                TotalJobOrders = totalJobOrders,
                TotalOutstandingAmount = valuations.Sum(v => v.TotalValue), // Simplified
                FinishedGoodsCount = finishedGoodsCount,
                RawMaterialStockCount = rawMaterialCount,
                Valuations = valuations,
                Efficiencies = efficiencies,
                RecentActivities = recentActivities,
                StockAlerts = stockAlerts,
                TotalInventoryValue = valuations.Sum(v => v.TotalValue)
            };
        }
    }
}
