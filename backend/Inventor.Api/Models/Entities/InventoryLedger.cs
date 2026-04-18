using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class InventoryLedger
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        public Guid? ProcessExecutionId { get; set; }
        public ProcessExecution? ProcessExecution { get; set; }
        public LedgerDirection Direction { get; set; }
        public decimal Quantity { get; set; }
        public required string UOM { get; set; }
        public double UnitCost { get; set; }
        public double TotalCost { get; set; }
        public required string EventType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
