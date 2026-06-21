

using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Entities;

namespace Inventor.Api.Models.Mapper
{
    public static class MappingToEntityExtensions
    {
        public static ProcessExecution ToEntity(this ProcessExecutionDto dto)
        {
            return new ProcessExecution
            {
                Id = dto.Id,
                TenantId = "", // Handled by SaveChanges
                ProcessDefinitionVersionId = dto.ProcessDefinitionVersionId,
                VendorId = dto.VendorId,
                Status = dto.Status,
                PlannedQty = dto.PlannedQty,
                ActualOutputQty = dto.ActualOutputQty,
                ScrapQty = dto.ScrapQty
            };
        }

        //CreateProductRequest request
        public static Product ToEntity(this CreateProductRequest request)
        {
            return new Product
            {
                Id = Guid.NewGuid(),
                TenantId = "", // Handled by SaveChanges
                Code = request.Code,
                Name = request.Name,
                ProductType = request.ProductType,
                UOM = request.UOM,
                CurrentQuantity = 0
            };
        }
    }
}
