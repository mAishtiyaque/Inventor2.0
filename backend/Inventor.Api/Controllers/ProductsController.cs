using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inventor.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            var products = await _productService.GetProductsAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
        {
            var product = await _productService.GetProductAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductRequest request)
        {
            var product = await _productService.CreateProductAsync(request);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductRequest request)
        {
            try
            {
                await _productService.UpdateProductAsync(id, request);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            try
            {
                await _productService.DeleteProductAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string query)
        {
            var products = await _productService.SearchProductsAsync(query);
            return Ok(products);
        }

        // Cost Management Endpoints
        [HttpGet("{id}/costs")]
        [HttpGet("{id}/costs/history")]
        public async Task<ActionResult<IEnumerable<ProductCostDto>>> GetProductCosts(Guid id, [FromQuery] CostType? costType)
        {
            var costs = await _productService.GetProductCostHistoryAsync(id, costType);
            return Ok(costs);
        }

        [HttpPost("{id}/costs")]
        public async Task<ActionResult<ProductCostDto>> AddProductCost(Guid id, CreateProductCostRequest request)
        {
            try
            {
                var cost = await _productService.AddProductCostAsync(id, request);
                return CreatedAtAction(nameof(GetProductCosts), new { id = id }, cost);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPut("{id}/costs/{costType}")]
        public async Task<ActionResult<ProductCostDto>> UpdateProductCost(Guid id, CostType costType, CreateProductCostRequest request)
        {
            try
            {
                // Ensure the request cost type matches the URL route parameter
                if (request.CostType != costType)
                {
                    return BadRequest("Cost type in body does not match route parameter");
                }

                var cost = await _productService.UpdateProductCostAsync(id, costType, request);
                return Ok(cost);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}/costs/{costType}")]
        public async Task<IActionResult> RemoveProductCost(Guid id, CostType costType)
        {
            try
            {
                await _productService.RemoveProductCostAsync(id, costType);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // Price Management Endpoints
        [HttpGet("{id}/prices")]
        [HttpGet("{id}/prices/history")]
        public async Task<ActionResult<IEnumerable<ProductPriceDto>>> GetProductPrices(Guid id, [FromQuery] PriceType? priceType)
        {
            var prices = await _productService.GetProductPriceHistoryAsync(id, priceType);
            return Ok(prices);
        }

        [HttpPost("{id}/prices")]
        public async Task<ActionResult<ProductPriceDto>> AddProductPrice(Guid id, CreateProductPriceRequest request)
        {
            try
            {
                var price = await _productService.AddProductPriceAsync(id, request);
                return CreatedAtAction(nameof(GetProductPrices), new { id = id }, price);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPut("{id}/prices/{priceType}")]
        public async Task<ActionResult<ProductPriceDto>> UpdateProductPrice(Guid id, PriceType priceType, CreateProductPriceRequest request)
        {
            try
            {
                // Ensure the request price type matches the URL route parameter
                if (request.PriceType != priceType)
                {
                    return BadRequest("Price type in body does not match route parameter");
                }

                var price = await _productService.UpdateProductPriceAsync(id, priceType, request);
                return Ok(price);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}/prices/{priceType}")]
        public async Task<IActionResult> RemoveProductPrice(Guid id, PriceType priceType)
        {
            try
            {
                await _productService.RemoveProductPriceAsync(id, priceType);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
