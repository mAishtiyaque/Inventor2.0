using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class ProductPrice
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        public PriceType PriceType { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public bool IsActive { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
