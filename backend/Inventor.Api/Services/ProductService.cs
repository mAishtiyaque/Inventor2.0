using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Entities;
using Inventor.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Inventor.Api.Models.Mapper;

namespace Inventor.Api.Services
{
    public class ProductService : IProductService
    {
        private readonly InventoryDbContext _context;

        public ProductService(InventoryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetProductsAsync(string tab)
        {
            List<Product> products = new List<Product>();
            if(tab=="all"){
            products = await _context.Products
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .ToListAsync();
            }
            else if (tab=="products"){
            products = await _context.Products
                .Where(p => p.ProductType==ProductType.FG || p.ProductType==ProductType.WIP)
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .ToListAsync();
            }
            else if (tab=="raw"){
            products = await _context.Products
                .Where(p => p.ProductType==ProductType.RAW)
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .ToListAsync();
            }
            else if (tab=="wip"){
            products = await _context.Products
                .Where(p => p.ProductType==ProductType.WIP)
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .ToListAsync();
            }
            else if (tab=="fg"){
            products = await _context.Products
                .Where(p => p.ProductType==ProductType.FG)
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .ToListAsync();
            }
            else if (tab=="scrap"){
                products = await _context.Products
                .Where(p => p.ProductType==ProductType.SCRAP)
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .ToListAsync();
            }

            // return products.Select(p => new ProductDto
            // {
            //     Id = p.Id,
            //     Code = p.Code,
            //     Name = p.Name,
            //     ProductType = p.ProductType,
            //     UOM = p.UOM,
            //     CurrentQuantity = p.CurrentQuantity,
            //     Costs = p.Costs?.Select(c => new ProductCostDto
            //     {
            //         Id = c.Id,
            //         CostType = c.CostType,
            //         Amount = c.Amount,
            //         UOM = c.UOM,
            //         IsActive = c.IsActive,
            //         EffectiveFrom = c.EffectiveFrom,
            //         EffectiveTo = c.EffectiveTo,
            //         Notes = c.Notes,
            //         CreatedAt = c.CreatedAt
            //     }).ToList(),
            //     Prices = p.Prices?.Select(pr => new ProductPriceDto
            //     {
            //         Id = pr.Id,
            //         PriceType = pr.PriceType,
            //         Amount = pr.Amount,
            //         Currency = pr.Currency,
            //         IsActive = pr.IsActive,
            //         EffectiveFrom = pr.EffectiveFrom,
            //         EffectiveTo = pr.EffectiveTo,
            //         Notes = pr.Notes,
            //         CreatedAt = pr.CreatedAt
            //     }).ToList()
            // });
            return products.Select(p => p.ToDto());
        }

        public async Task<ProductDto?> GetProductAsync(Guid id)
        {
            var product = await _context.Products
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (product == null) return null;

            // return new ProductDto
            // {
            //     Id = product.Id,
            //     Code = product.Code,
            //     Name = product.Name,
            //     ProductType = product.ProductType,
            //     UOM = product.UOM,
            //     CurrentQuantity = product.CurrentQuantity,
            //     Costs = product.Costs?.Select(c => new ProductCostDto
            //     {
            //         Id = c.Id,
            //         CostType = c.CostType,
            //         Amount = c.Amount,
            //         UOM = c.UOM,
            //         IsActive = c.IsActive,
            //         EffectiveFrom = c.EffectiveFrom,
            //         EffectiveTo = c.EffectiveTo,
            //         Notes = c.Notes,
            //         CreatedAt = c.CreatedAt
            //     }).ToList(),
            //     Prices = product.Prices?.Select(pr => new ProductPriceDto
            //     {
            //         Id = pr.Id,
            //         PriceType = pr.PriceType,
            //         Amount = pr.Amount,
            //         Currency = pr.Currency,
            //         IsActive = pr.IsActive,
            //         EffectiveFrom = pr.EffectiveFrom,
            //         EffectiveTo = pr.EffectiveTo,
            //         Notes = pr.Notes,
            //         CreatedAt = pr.CreatedAt
            //     }).ToList()
            // };
            return product.ToDto();
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductRequest request)
        {
            //var product = new Product
            //{
            //    Id = Guid.NewGuid(),
            //    Code = request.Code,
            //    Name = request.Name,
            //    ProductType = request.ProductType,
            //    UOM = request.UOM,
            //    TenantId = "", // Handled by SaveChanges
            //    CurrentQuantity = 0
            //};
            var product = request.ToEntity();

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Add costs if provided
            if (request.Costs != null && request.Costs.Count > 0)
            {
                var costs = request.Costs.Select(c => new ProductCost
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    CostType = c.CostType,
                    Amount = c.Amount,
                    UOM = c.UOM,
                    IsActive = true,
                    EffectiveFrom = c.EffectiveFrom,
                    Notes = c.Notes,
                    CreatedAt = DateTime.UtcNow,
                    TenantId = "" // Handled by SaveChanges
                });
                _context.ProductCosts.AddRange(costs);
            }

            // Add prices if provided
            if (request.Prices != null && request.Prices.Count > 0)
            {
                var prices = request.Prices.Select(pr => new ProductPrice
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    PriceType = pr.PriceType,
                    Amount = pr.Amount,
                    Currency = pr.Currency,
                    IsActive = true,
                    EffectiveFrom = pr.EffectiveFrom,
                    Notes = pr.Notes,
                    CreatedAt = DateTime.UtcNow,
                    TenantId = "" // Handled by SaveChanges
                });
                _context.ProductPrices.AddRange(prices);
            }

            await _context.SaveChangesAsync();

            // Return the created product with its costs and prices
            return await GetProductAsync(product.Id) ?? throw new InvalidOperationException("Failed to retrieve created product");
        }

        public async Task UpdateProductAsync(Guid id, UpdateProductRequest request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException("Product not found");

            product.Name = request.Name;
            product.Code = request.Code;
            product.ProductType = request.ProductType;
            product.UOM = request.UOM;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteProductAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException("Product not found");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string query)
        {
            var products = await _context.Products
                .Include(p => p.Costs.Where(c => c.IsActive))
                .Include(p => p.Prices.Where(pr => pr.IsActive))
                .Where(p => p.Name.Contains(query) || p.Code.Contains(query))
                .ToListAsync();

            // return products.Select(p => new ProductDto
            // {
            //     Id = p.Id,
            //     Code = p.Code,
            //     Name = p.Name,
            //     ProductType = p.ProductType,
            //     UOM = p.UOM,
            //     CurrentQuantity = p.CurrentQuantity,
            //     Costs = p.Costs?.Select(c => new ProductCostDto
            //     {
            //         Id = c.Id,
            //         CostType = c.CostType,
            //         Amount = c.Amount,
            //         UOM = c.UOM,
            //         IsActive = c.IsActive,
            //         EffectiveFrom = c.EffectiveFrom,
            //         EffectiveTo = c.EffectiveTo,
            //         Notes = c.Notes,
            //         CreatedAt = c.CreatedAt
            //     }).ToList(),
            //     Prices = p.Prices?.Select(pr => new ProductPriceDto
            //     {
            //         Id = pr.Id,
            //         PriceType = pr.PriceType,
            //         Amount = pr.Amount,
            //         Currency = pr.Currency,
            //         IsActive = pr.IsActive,
            //         EffectiveFrom = pr.EffectiveFrom,
            //         EffectiveTo = pr.EffectiveTo,
            //         Notes = pr.Notes,
            //         CreatedAt = pr.CreatedAt
            //     }).ToList()
            // });
            return products.Select(p => p.ToDto());
        }

        // Product Cost Management
        public async Task<IEnumerable<ProductCostDto>> GetProductCostHistoryAsync(Guid productId, CostType? costType = null)
        {
            var query = _context.ProductCosts.Where(c => c.ProductId == productId);
            
            if (costType.HasValue)
            {
                query = query.Where(c => c.CostType == costType.Value);
            }

            var costs = await query.OrderByDescending(c => c.EffectiveFrom).ToListAsync();

            // return costs.Select(c => new ProductCostDto
            // {
            //     Id = c.Id,
            //     CostType = c.CostType,
            //     Amount = c.Amount,
            //     UOM = c.UOM,
            //     IsActive = c.IsActive,
            //     EffectiveFrom = c.EffectiveFrom,
            //     EffectiveTo = c.EffectiveTo,
            //     Notes = c.Notes,
            //     CreatedAt = c.CreatedAt
            // });
            return costs.Select(c => c.ToDto());
        }

        public async Task<ProductCostDto> AddProductCostAsync(Guid productId, CreateProductCostRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new KeyNotFoundException("Product not found");

            var cost = new ProductCost
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                CostType = request.CostType,
                Amount = request.Amount,
                UOM = request.UOM,
                IsActive = true,
                EffectiveFrom = request.EffectiveFrom,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                TenantId = "" // Handled by SaveChanges
            };

            _context.ProductCosts.Add(cost);
            await _context.SaveChangesAsync();

            // return new ProductCostDto
            // {
            //     Id = cost.Id,
            //     CostType = cost.CostType,
            //     Amount = cost.Amount,
            //     UOM = cost.UOM,
            //     IsActive = cost.IsActive,
            //     EffectiveFrom = cost.EffectiveFrom,
            //     EffectiveTo = cost.EffectiveTo,
            //     Notes = cost.Notes,
            //     CreatedAt = cost.CreatedAt
            // };
            return cost.ToDto();
        }

        public async Task<ProductCostDto> UpdateProductCostAsync(Guid productId, CostType costType, CreateProductCostRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new KeyNotFoundException("Product not found");

            // Find the current active cost of this type
            var currentCost = await _context.ProductCosts
                .FirstOrDefaultAsync(c => c.ProductId == productId && c.CostType == costType && c.IsActive);

            if (currentCost != null)
            {
                // Deactivate the current cost
                currentCost.IsActive = false;
                currentCost.EffectiveTo = DateTime.UtcNow;
            }

            // Create a new cost record
            var newCost = new ProductCost
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                CostType = request.CostType,
                Amount = request.Amount,
                UOM = request.UOM,
                IsActive = true,
                EffectiveFrom = request.EffectiveFrom,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                TenantId = "" // Handled by SaveChanges
            };

            _context.ProductCosts.Add(newCost);
            await _context.SaveChangesAsync();

            // return new ProductCostDto
            // {
            //     Id = newCost.Id,
            //     CostType = newCost.CostType,
            //     Amount = newCost.Amount,
            //     UOM = newCost.UOM,
            //     IsActive = newCost.IsActive,
            //     EffectiveFrom = newCost.EffectiveFrom,
            //     EffectiveTo = newCost.EffectiveTo,
            //     Notes = newCost.Notes,
            //     CreatedAt = newCost.CreatedAt
            // };
            return newCost.ToDto();
        }

        public async Task RemoveProductCostAsync(Guid productId, CostType costType)
        {
            var cost = await _context.ProductCosts
                .FirstOrDefaultAsync(c => c.ProductId == productId && c.CostType == costType && c.IsActive);

            if (cost == null) throw new KeyNotFoundException("Active cost not found");

            cost.IsActive = false;
            cost.EffectiveTo = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // Product Price Management
        public async Task<IEnumerable<ProductPriceDto>> GetProductPriceHistoryAsync(Guid productId, PriceType? priceType = null)
        {
            var query = _context.ProductPrices.Where(p => p.ProductId == productId);
            
            if (priceType.HasValue)
            {
                query = query.Where(p => p.PriceType == priceType.Value);
            }

            var prices = await query.OrderByDescending(p => p.EffectiveFrom).ToListAsync();

            // return prices.Select(p => new ProductPriceDto
            // {
            //     Id = p.Id,
            //     PriceType = p.PriceType,
            //     Amount = p.Amount,
            //     Currency = p.Currency,
            //     IsActive = p.IsActive,
            //     EffectiveFrom = p.EffectiveFrom,
            //     EffectiveTo = p.EffectiveTo,
            //     Notes = p.Notes,
            //     CreatedAt = p.CreatedAt
            // });
            return prices.Select(p => p.ToDto());
        }

        public async Task<ProductPriceDto> AddProductPriceAsync(Guid productId, CreateProductPriceRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new KeyNotFoundException("Product not found");

            var price = new ProductPrice
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                PriceType = request.PriceType,
                Amount = request.Amount,
                Currency = request.Currency,
                IsActive = true,
                EffectiveFrom = request.EffectiveFrom,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                TenantId = "" // Handled by SaveChanges
            };

            _context.ProductPrices.Add(price);
            await _context.SaveChangesAsync();

            // return new ProductPriceDto
            // {
            //     Id = price.Id,
            //     PriceType = price.PriceType,
            //     Amount = price.Amount,
            //     Currency = price.Currency,
            //     IsActive = price.IsActive,
            //     EffectiveFrom = price.EffectiveFrom,
            //     EffectiveTo = price.EffectiveTo,
            //     Notes = price.Notes,
            //     CreatedAt = price.CreatedAt
            // };
            return price.ToDto();
        }

        public async Task<ProductPriceDto> UpdateProductPriceAsync(Guid productId, PriceType priceType, CreateProductPriceRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new KeyNotFoundException("Product not found");

            // Find the current active price of this type
            var currentPrice = await _context.ProductPrices
                .FirstOrDefaultAsync(p => p.ProductId == productId && p.PriceType == priceType && p.IsActive);

            if (currentPrice != null)
            {
                // Deactivate the current price
                currentPrice.IsActive = false;
                currentPrice.EffectiveTo = DateTime.UtcNow;
            }

            // Create a new price record
            var newPrice = new ProductPrice
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                PriceType = request.PriceType,
                Amount = request.Amount,
                Currency = request.Currency,
                IsActive = true,
                EffectiveFrom = request.EffectiveFrom,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                TenantId = "" // Handled by SaveChanges
            };

            _context.ProductPrices.Add(newPrice);
            await _context.SaveChangesAsync();

            // return new ProductPriceDto
            // {
            //     Id = newPrice.Id,
            //     PriceType = newPrice.PriceType,
            //     Amount = newPrice.Amount,
            //     Currency = newPrice.Currency,
            //     IsActive = newPrice.IsActive,
            //     EffectiveFrom = newPrice.EffectiveFrom,
            //     EffectiveTo = newPrice.EffectiveTo,
            //     Notes = newPrice.Notes,
            //     CreatedAt = newPrice.CreatedAt
            // };
            return newPrice.ToDto();
        }

        public async Task RemoveProductPriceAsync(Guid productId, PriceType priceType)
        {
            var price = await _context.ProductPrices
                .FirstOrDefaultAsync(p => p.ProductId == productId && p.PriceType == priceType && p.IsActive);

            if (price == null) throw new KeyNotFoundException("Active price not found");

            price.IsActive = false;
            price.EffectiveTo = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
