using Inventor.Api.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inventor.Api.Interfaces
{
    public interface IVendorService
    {
        Task<IEnumerable<VendorDto>> GetVendorsAsync(bool includeInactive = false);
        Task<VendorDto?> GetVendorAsync(Guid id);
        Task<VendorDto> CreateVendorAsync(CreateVendorRequest request);
        Task<VendorDto> UpdateVendorAsync(Guid id, UpdateVendorRequest request);
        Task DeleteVendorAsync(Guid id);
    }
}
