using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProcessIODefinition
    {
        public Guid Id { get; set; }
        public string TenantId { get; set; } = string.Empty;
        public Guid ProcessDefinitionVersionId { get; set; }
        public ProcessDefinitionVersion? ProcessDefinitionVersion { get; set; }
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        public IODirection Direction { get; set; }
        public decimal StandardQty { get; set; }
        public string? UOM { get; set; }
        public decimal ScrapPercentage { get; set; }
    }
}
