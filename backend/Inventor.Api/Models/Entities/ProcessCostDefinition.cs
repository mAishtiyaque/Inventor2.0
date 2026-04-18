using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProcessCostDefinition
    {
        public Guid Id { get; set; }
        public string TenantId { get; set; } = string.Empty;
        public Guid ProcessDefinitionVersionId { get; set; }
        public ProcessDefinitionVersion? ProcessDefinitionVersion { get; set; }
        public CostType CostType { get; set; }
        public double Rate { get; set; }
        public string? UOM { get; set; }
    }
}
