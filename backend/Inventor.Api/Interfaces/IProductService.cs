using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetProductsAsync();
        Task<ProductDto?> GetProductAsync(Guid id);
        Task<ProductDto> CreateProductAsync(CreateProductRequest request);
        Task UpdateProductAsync(Guid id, UpdateProductRequest request);
        Task DeleteProductAsync(Guid id);
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string query);

        // Product Cost Management
        Task<IEnumerable<ProductCostDto>> GetProductCostHistoryAsync(Guid productId, CostType? costType = null);
        Task<ProductCostDto> AddProductCostAsync(Guid productId, CreateProductCostRequest request);
        Task<ProductCostDto> UpdateProductCostAsync(Guid productId, CostType costType, CreateProductCostRequest request);
        Task RemoveProductCostAsync(Guid productId, CostType costType);

        // Product Price Management
        Task<IEnumerable<ProductPriceDto>> GetProductPriceHistoryAsync(Guid productId, PriceType? priceType = null);
        Task<ProductPriceDto> AddProductPriceAsync(Guid productId, CreateProductPriceRequest request);
        Task<ProductPriceDto> UpdateProductPriceAsync(Guid productId, PriceType priceType, CreateProductPriceRequest request);
        Task RemoveProductPriceAsync(Guid productId, PriceType priceType);
    }
}
