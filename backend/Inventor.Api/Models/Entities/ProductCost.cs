using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProductCost
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        public CostType CostType { get; set; }
        public double Amount { get; set; }
        public string? UOM { get; set; }
        public bool IsActive { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
