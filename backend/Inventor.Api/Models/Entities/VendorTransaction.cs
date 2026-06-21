using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.Entities
{
    public class VendorTransaction
    {
        public Guid Id { get; set; }
        public required string TenantId { get; set; }
        public Guid VendorId { get; set; }
        public Vendor? Vendor { get; set; }

        public VendorTransactionType TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; } = "INR";
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string? Reference { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
