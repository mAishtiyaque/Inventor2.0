using System;
using System.Collections.Generic;

namespace Inventor.Api.Models.Entities
{
    public class ProcessDefinition
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public ICollection<ProcessDefinitionVersion> Versions { get; set; } = new List<ProcessDefinitionVersion>();
    }
}
