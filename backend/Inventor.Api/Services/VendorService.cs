using Inventor.Api.Data;
using Inventor.Api.Exceptions;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Entities;
using Inventor.Api.Models.Mapper;
using Microsoft.EntityFrameworkCore;

namespace Inventor.Api.Services
{
    public class VendorService : IVendorService
    {
        private readonly InventoryDbContext _context;

        public VendorService(InventoryDbContext context)
        {
            _context = context;
        }

        // Note: Vendor finance operations are handled by VendorFinanceService

        public async Task<IEnumerable<VendorDto>> GetVendorsAsync(bool includeInactive = false)
        {
            var query = _context.Vendors.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            return await query
                .OrderBy(p => p.Name)
                .Select(p => p.ToDto())
                .ToListAsync();
        }

        public async Task<VendorDto?> GetVendorAsync(Guid id)
        {
            var endor = await _context.Vendors.FirstOrDefaultAsync(p => p.Id == id);
            return endor?.ToDto();
        }

        public async Task<VendorDto> CreateVendorAsync(CreateVendorRequest request)
        {
            var endor = new Vendor
            {
                Id = Guid.NewGuid(),
                TenantId = "",
                Code = request.Code.Trim(),
                Name = request.Name.Trim(),
                VendorType = string.IsNullOrWhiteSpace(request.VendorType) ? "Broker" : request.VendorType.Trim(),
                ContactName = request.ContactName,
                Phone = request.Phone,
                Email = request.Email,
                Address = request.Address,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vendors.Add(endor);
            await _context.SaveChangesAsync();

            return endor.ToDto();
        }

        public async Task<VendorDto> UpdateVendorAsync(Guid id, UpdateVendorRequest request)
        {
            var endor = await _context.Vendors.FirstOrDefaultAsync(p => p.Id == id);
            if (endor == null)
            {
                throw new NotFoundException("Vendor not found");
            }

            endor.Code = request.Code.Trim();
            endor.Name = request.Name.Trim();
            endor.VendorType = string.IsNullOrWhiteSpace(request.VendorType) ? "Broker" : request.VendorType.Trim();
            endor.ContactName = request.ContactName;
            endor.Phone = request.Phone;
            endor.Email = request.Email;
            endor.Address = request.Address;
            endor.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return endor.ToDto();
        }

        public async Task DeleteVendorAsync(Guid id)
        {
            var endor = await _context.Vendors.FirstOrDefaultAsync(p => p.Id == id);
            if (endor == null)
            {
                throw new NotFoundException("Vendor not found");
            }

            endor.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }
}
