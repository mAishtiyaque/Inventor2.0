using Inventor.Api.Models.Enums;
using System;

namespace Inventor.Api.Models.DTOs
{
    public class LedgerEntryDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string? ProductName { get; set; }
        public LedgerDirection Direction { get; set; }
        public decimal Quantity { get; set; }
        public required string UOM { get; set; }
        public double UnitCost { get; set; }
        public double TotalCost { get; set; }
        public required string EventType { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLedgerEntryRequest
    {
        public Guid ProductId { get; set; }
        public LedgerDirection Direction { get; set; }
        public decimal Quantity { get; set; }
        public double UnitCost { get; set; }
        public required string EventType { get; set; }
    }
}
