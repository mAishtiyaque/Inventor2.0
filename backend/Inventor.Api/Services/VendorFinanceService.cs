using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventor.Api.Services
{
    public class VendorFinanceService : IVendorFinanceService
    {
        private readonly InventoryDbContext _context;

        public VendorFinanceService(InventoryDbContext context)
        {
            _context = context;
        }

        public async Task<VendorBalanceDto> GetBalanceAsync(Guid vendorId)
        {
            var total = await _context.VendorTransactions
                .Where(t => t.VendorId == vendorId)
                .SumAsync(t => (decimal?) (t.TransactionType == Models.Enums.VendorTransactionType.Payment ? -t.Amount : t.Amount)) ?? 0m;

            return new VendorBalanceDto { Balance = total, Currency = "INR" };
        }

        public async Task<IEnumerable<VendorTransactionDto>> GetTransactionsAsync(Guid vendorId, DateTime? from = null, DateTime? to = null)
        {
            var q = _context.VendorTransactions.AsQueryable().Where(t => t.VendorId == vendorId);
            if (from.HasValue) q = q.Where(t => t.TransactionDate >= from.Value);
            if (to.HasValue) q = q.Where(t => t.TransactionDate <= to.Value);

            return await q.OrderByDescending(t => t.TransactionDate)
                .Select(t => new VendorTransactionDto
                {
                    Id = t.Id,
                    TransactionType = t.TransactionType,
                    Amount = t.Amount,
                    Currency = t.Currency,
                    TransactionDate = t.TransactionDate,
                    Reference = t.Reference,
                    Notes = t.Notes
                }).ToListAsync();
        }

        public async Task<VendorTransactionDto> CreateTransactionAsync(Guid vendorId, CreateVendorTransactionRequest request)
        {
            var vendor = await _context.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId);
            if (vendor == null) throw new KeyNotFoundException("Vendor not found");

            var tx = new VendorTransaction
            {
                Id = Guid.NewGuid(),
                TenantId = vendor.TenantId,
                VendorId = vendorId,
                TransactionType = request.TransactionType,
                Amount = request.Amount,
                Currency = string.IsNullOrWhiteSpace(request.Currency) ? "INR" : request.Currency,
                TransactionDate = request.TransactionDate ?? DateTime.UtcNow,
                Reference = request.Reference,
                Notes = request.Notes
            };

            _context.VendorTransactions.Add(tx);
            await _context.SaveChangesAsync();

            return new VendorTransactionDto
            {
                Id = tx.Id,
                TransactionType = tx.TransactionType,
                Amount = tx.Amount,
                Currency = tx.Currency,
                TransactionDate = tx.TransactionDate,
                Reference = tx.Reference,
                Notes = tx.Notes
            };
        }

        public async Task<VendorTransactionDto> UpdateTransactionAsync(Guid vendorId, Guid txId, UpdateVendorTransactionRequest request)
        {
            var tx = await _context.VendorTransactions.FirstOrDefaultAsync(t => t.Id == txId && t.VendorId == vendorId);
            if (tx == null) throw new KeyNotFoundException("Transaction not found");

            tx.TransactionType = request.TransactionType;
            tx.Amount = request.Amount;
            tx.Currency = request.Currency;
            tx.TransactionDate = request.TransactionDate ?? tx.TransactionDate;
            tx.Reference = request.Reference;
            tx.Notes = request.Notes;

            await _context.SaveChangesAsync();

            return new VendorTransactionDto
            {
                Id = tx.Id,
                TransactionType = tx.TransactionType,
                Amount = tx.Amount,
                Currency = tx.Currency,
                TransactionDate = tx.TransactionDate,
                Reference = tx.Reference,
                Notes = tx.Notes
            };
        }

        public async Task DeleteTransactionAsync(Guid vendorId, Guid txId)
        {
            var tx = await _context.VendorTransactions.FirstOrDefaultAsync(t => t.Id == txId && t.VendorId == vendorId);
            if (tx == null) throw new KeyNotFoundException("Transaction not found");

            _context.VendorTransactions.Remove(tx);
            await _context.SaveChangesAsync();
        }
    }
}
