using Inventor.Api.Models.Enums;
using System;

namespace Inventor.Api.Models.DTOs
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public ProductType ProductType { get; set; }
        public required string UOM { get; set; }
        public decimal CurrentQuantity { get; set; }
        public List<ProductCostDto>? Costs { get; set; }
        public List<ProductPriceDto>? Prices { get; set; }
    }

    public class CreateProductRequest
    {
        public required string Code { get; set; }
        public required string Name { get; set; }
        public ProductType ProductType { get; set; }
        public required string UOM { get; set; }
        public List<CreateProductCostRequest>? Costs { get; set; }
        public List<CreateProductPriceRequest>? Prices { get; set; }
    }

    //UpdateProductRequest
    public class UpdateProductRequest
    {
        public required string Code { get; set; }
        public required string Name { get; set; }
        public ProductType ProductType { get; set; }
        public required string UOM { get; set; }
    }

    // Product Cost DTOs
    public class ProductCostDto
    {
        public Guid Id { get; set; }
        public CostType CostType { get; set; }
        public double Amount { get; set; }
        public string? UOM { get; set; }
        public bool IsActive { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductCostRequest
    {
        public CostType CostType { get; set; }
        public double Amount { get; set; }
        public string? UOM { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public string? Notes { get; set; }
    }

    // Product Price DTOs
    public class ProductPriceDto
    {
        public Guid Id { get; set; }
        public PriceType PriceType { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public bool IsActive { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductPriceRequest
    {
        public PriceType PriceType { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public string? Notes { get; set; }
    }
}
