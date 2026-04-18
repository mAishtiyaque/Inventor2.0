using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class Product
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public ProductType ProductType { get; set; }
        public required string UOM { get; set; }
        public decimal CurrentQuantity { get; set; } // Derived or tracked
        
        // Navigation properties
        public ICollection<ProductCost> Costs { get; set; } = [];
        public ICollection<ProductPrice> Prices { get; set; } = [];

        public double GetAggregateCost()
        {
            return Costs.Aggregate(0.0, (x, p) =>
            {
                if (p.IsActive)
                {
                    return x + p.Amount;
                }
                return x;
            });
        }
    }
}
