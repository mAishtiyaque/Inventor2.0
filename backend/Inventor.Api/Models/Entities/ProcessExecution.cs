using System;
using System.Collections.Generic;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProcessExecution
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public Guid ProcessDefinitionVersionId { get; set; }
        public ProcessDefinitionVersion? ProcessDefinitionVersion { get; set; }
        public Guid? VendorId { get; set; } // Reference to a broker/vendor if applicable
        public Vendor? Vendor { get; set; }
        public decimal PlannedQty { get; set; }
        public decimal ActualOutputQty { get; set; }
        public decimal ScrapQty { get; set; }
        public double TotalCost { get; set; }
        public ExecutionStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public ICollection<ProcessExecutionIO> IOs { get; set; } = new List<ProcessExecutionIO>();
        public ICollection<ProcessExecutionCost> Costs { get; set; } = new List<ProcessExecutionCost>();
    }
}
