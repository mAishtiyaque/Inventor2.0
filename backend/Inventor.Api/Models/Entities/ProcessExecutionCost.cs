using Inventor.Api.Models.Enums;
using System;

namespace Inventor.Api.Models.Entities
{
    public class ProcessExecutionCost
    {
        public Guid Id { get; set; }
        public string TenantId { get; set; } = string.Empty;
        public Guid ProcessExecutionId { get; set; }
        public ProcessExecution? ProcessExecution { get; set; }
        public CostType CostType { get; set; }
        public double Rate { get; set; }
        public decimal Quantity { get; set; }
        public double TotalCost { get; set; }
    }
}
