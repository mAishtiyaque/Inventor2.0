using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inventor.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendorsController : ControllerBase
    {
        private readonly IVendorService _endorService;

        public VendorsController(IVendorService endorService)
        {
            _endorService = endorService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VendorDto>>> GetVendors([FromQuery] bool includeInactive = false)
        {
            return Ok(await _endorService.GetVendorsAsync(includeInactive));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VendorDto>> GetVendor(Guid id)
        {
            var endor = await _endorService.GetVendorAsync(id);
            return endor == null ? NotFound() : Ok(endor);
        }

        [HttpPost]
        public async Task<ActionResult<VendorDto>> CreateVendor(CreateVendorRequest request)
        {
            var endor = await _endorService.CreateVendorAsync(request);
            return CreatedAtAction(nameof(GetVendor), new { id = endor.Id }, endor);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VendorDto>> UpdateVendor(Guid id, UpdateVendorRequest request)
        {
            return Ok(await _endorService.UpdateVendorAsync(id, request));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(Guid id)
        {
            await _endorService.DeleteVendorAsync(id);
            return NoContent();
        }
    }
}
