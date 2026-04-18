using System.Collections.Generic;

namespace Inventor.Api.Models.DTOs
{
    public class InventoryValuationDto
    {
        public required string ProductType { get; set; }
        public decimal TotalQuantity { get; set; }
        public decimal TotalValue { get; set; }
    }

    public class ManufacturingEfficiencyDto
    {
        public required string ProcessName { get; set; }
        public decimal PlannedQty { get; set; }
        public decimal ActualQty { get; set; }
        public decimal EfficiencyPercentage => PlannedQty > 0 ? (ActualQty / PlannedQty) * 100 : 0;
    }

    public class RecentActivityDto
    {
        public required string Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Status { get; set; } // COMPLETED, IN_PROGRESS, etc.
        public required string Color { get; set; } // emerald, orange, blue
    }

    public class StockAlertDto
    {
        public required string Name { get; set; }
        public required string Type { get; set; } // Product, Material
        public required decimal Recommendation { get; set; }
        public required decimal Stock { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int TotalJobOrders { get; set; }
        public decimal TotalOutstandingAmount { get; set; }
        public decimal FinishedGoodsCount { get; set; }
        public decimal RawMaterialStockCount { get; set; }
        public List<InventoryValuationDto> Valuations { get; set; } = new();
        public List<ManufacturingEfficiencyDto> Efficiencies { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
        public List<StockAlertDto> StockAlerts { get; set; } = new();
        public decimal TotalInventoryValue { get; set; }
    }
}
