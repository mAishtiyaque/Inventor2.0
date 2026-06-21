using System;
using System.Collections.Generic;

namespace Inventor.Api.Models.Entities
{
    public class Vendor
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string VendorType { get; set; } = "Broker";
        public string? ContactName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ProcessExecution> ProcessExecutions { get; set; } = new List<ProcessExecution>();
    }
}
