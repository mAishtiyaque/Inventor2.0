using System;

namespace Inventor.Api.Models.DTOs
{
    public class VendorDto
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string VendorType { get; set; } = "Broker";
        public string? ContactName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVendorRequest
    {
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string VendorType { get; set; } = "Broker";
        public string? ContactName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateVendorRequest : CreateVendorRequest
    {
    }
}
