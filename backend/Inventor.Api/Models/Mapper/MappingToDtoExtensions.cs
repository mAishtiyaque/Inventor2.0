using Inventor.Api.Data;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Entities;
using System.Linq;

namespace Inventor.Api.Models.Mapper
{
    public static class MappingToDtoExtensions
    {
        public static ProductDto ToDto(this Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Code = product.Code,
                Name = product.Name,
                ProductType = product.ProductType,
                UOM = product.UOM,
                CurrentQuantity = product.CurrentQuantity,
                Costs = product.Costs?.Select(c => c.ToDto()).ToList(),
                Prices = product.Prices?.Select(p => p.ToDto()).ToList()
            };
        }

        public static VendorDto ToDto(this Vendor endor)
        {
            return new VendorDto
            {
                Id = endor.Id,
                Code = endor.Code,
                Name = endor.Name,
                VendorType = endor.VendorType,
                ContactName = endor.ContactName,
                Phone = endor.Phone,
                Email = endor.Email,
                Address = endor.Address,
                IsActive = endor.IsActive,
                CreatedAt = endor.CreatedAt
            };
        }

        public static ProductCostDto ToDto(this ProductCost cost)
        {
            return new ProductCostDto
            {
                Id = cost.Id,
                CostType = cost.CostType,
                Amount = cost.Amount,
                UOM = cost.UOM ?? string.Empty,
                IsActive = cost.IsActive,
                EffectiveFrom = cost.EffectiveFrom,
                EffectiveTo = cost.EffectiveTo,
                Notes = cost.Notes,
                CreatedAt = cost.CreatedAt
            };
        }

        public static ProductPriceDto ToDto(this ProductPrice price)
        {
            return new ProductPriceDto
            {
                Id = price.Id,
                PriceType = price.PriceType,
                Amount = price.Amount,
                Currency = price.Currency ?? "INR",
                IsActive = price.IsActive,
                EffectiveFrom = price.EffectiveFrom,
                EffectiveTo = price.EffectiveTo,
                Notes = price.Notes,
                CreatedAt = price.CreatedAt
            };
        }

        public static ProcessDefinitionDto ToDto(this ProcessDefinition definition)
        {
            return new ProcessDefinitionDto
            {
                Id = definition.Id,
                Name = definition.Name,
                Description = definition.Description,
                Versions = definition.Versions?.Select(v => v.ToDto()).ToList() ?? new()
            };
        }

        public static ProcessDefinitionVersionDto ToDto(this ProcessDefinitionVersion version)
        {
            return new ProcessDefinitionVersionDto
            {
                Id = version.Id,
                VersionNumber = version.VersionNumber,
                Status = version.Status,
                ProcessDefinitionId = version.ProcessDefinitionId,
                IsUsed = version.IsUsed,
                EffectiveFrom = version.EffectiveFrom,
                EffectiveTo = version.EffectiveTo,
                Notes = version.Notes,
                IOs = version.IOs?.Select(io => io.ToDto()).ToList() ?? new(),
                Costs = version.Costs?.Select(c => c.ToDto()).ToList() ?? new()
            };
        }

        public static ProcessIODefinitionDto ToDto(this ProcessIODefinition io)
        {
            return new ProcessIODefinitionDto
            {
                Id = io.Id,
                ProductId = io.ProductId,
                Product = io.Product?.ToDto(),
                Direction = io.Direction,
                StandardQty = io.StandardQty,
                UOM = io.UOM ?? string.Empty,
                ScrapPercentage = io.ScrapPercentage
            };
        }

        public static ProcessCostDefinitionDto ToDto(this ProcessCostDefinition cost)
        {
            return new ProcessCostDefinitionDto
            {
                Id = cost.Id,
                CostType = cost.CostType,
                Rate = cost.Rate,
                UOM = cost.UOM ?? string.Empty
            };
        }

        public static ProcessExecutionCostDto ToDto(this ProcessExecutionCost cost)
        {
            return new ProcessExecutionCostDto
            {
                Id = cost.Id,
                CostType = cost.CostType,
                Rate = cost.Rate,
                Quantity = cost.Quantity,
                TotalCost = cost.TotalCost
            };
        }
        
        public static ProcessExecutionDto ToDto(this ProcessExecution execution)
        {
            return new ProcessExecutionDto
            {
                Id = execution.Id,
                ProcessDefinitionVersionId = execution.ProcessDefinitionVersionId,
                ProcessDefinitionVersion = execution.ProcessDefinitionVersion?.ToDto() ?? new(),
                VendorId = execution.VendorId,
                Vendor = execution.Vendor?.ToDto(),
                PlannedQty = execution.PlannedQty,
                ActualOutputQty = execution.ActualOutputQty,
                ScrapQty = execution.ScrapQty,
                TotalCost = execution.TotalCost,
                Status = execution.Status,
                StartedAt = execution.StartedAt,
                CompletedAt = execution.CompletedAt,
                IOs = execution.IOs.Select(io => io.ToDto()).ToList(),
                Costs = execution.Costs.Select(c => c.ToDto()).ToList()
            };
        }

        public static ProcessExecutionIODto ToDto(this ProcessExecutionIO io)
        {
            return new ProcessExecutionIODto
            { 
                Id = io.Id,
                ProcessExecutionId = io.ProcessExecutionId,
                ProductId = io.ProductId,
                Product = io.Product?.ToDto(),
                Direction = io.Direction,
                PlannedQty = io.PlannedQty,
                ActualQty = io.ActualQty,
                UnitCost = io.UnitCost,
                ActualCost = io.ActualCost
            };
        }
    }
}
