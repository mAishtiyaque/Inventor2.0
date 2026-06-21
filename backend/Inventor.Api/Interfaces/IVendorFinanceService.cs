using Inventor.Api.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inventor.Api.Interfaces
{
    public interface IVendorFinanceService
    {
        Task<VendorBalanceDto> GetBalanceAsync(Guid vendorId);
        Task<IEnumerable<VendorTransactionDto>> GetTransactionsAsync(Guid vendorId, DateTime? from = null, DateTime? to = null);
        Task<VendorTransactionDto> CreateTransactionAsync(Guid vendorId, CreateVendorTransactionRequest request);
        Task<VendorTransactionDto> UpdateTransactionAsync(Guid vendorId, Guid txId, UpdateVendorTransactionRequest request);
        Task DeleteTransactionAsync(Guid vendorId, Guid txId);
    }
}
