using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProcessExecutionIO
    {
        public Guid Id { get; set; }
        public string TenantId { get; set; } = string.Empty;
        public Guid ProcessExecutionId { get; set; }
        public ProcessExecution? ProcessExecution { get; set; }
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        public IODirection Direction { get; set; }
        public decimal PlannedQty { get; set; }
        public decimal ActualQty { get; set; }
        public double UnitCost { get; set; }
        public double ActualCost { get; set; }
    }
}
