using System;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Models.DTOs
{
    public class VendorTransactionDto
    {
        public Guid Id { get; set; }
        public VendorTransactionType TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateVendorTransactionRequest
    {
        public VendorTransactionType TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public DateTime? TransactionDate { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateVendorTransactionRequest : CreateVendorTransactionRequest { }

    public class VendorBalanceDto
    {
        public decimal Balance { get; set; }
        public string Currency { get; set; } = "INR";
    }
}
