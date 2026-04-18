using System;
using System.Collections.Generic;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProcessDefinitionVersion
    {
        public Guid Id { get; set; }
        public string TenantId { get; set; } = string.Empty;
        public Guid ProcessDefinitionId { get; set; }
        public ProcessDefinition? ProcessDefinition { get; set; }
        public int VersionNumber { get; set; }
        public VersionStatus Status { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? Notes { get; set; }
        public bool IsUsed { get; set; }
        public ICollection<ProcessIODefinition> IOs { get; set; } = new List<ProcessIODefinition>();
        public ICollection<ProcessCostDefinition> Costs { get; set; } = new List<ProcessCostDefinition>();
    }
}
