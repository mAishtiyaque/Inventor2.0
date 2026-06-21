using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Inventor.Api.Controllers
{
    [ApiController]
    [Route("api/vendors/{vendorId:guid}/finance")]
    public class VendorFinanceController : ControllerBase
    {
        private readonly IVendorFinanceService _financeService;

        public VendorFinanceController(IVendorFinanceService financeService)
        {
            _financeService = financeService;
        }

        [HttpGet("balance")]
        public async Task<ActionResult<VendorBalanceDto>> GetBalance(Guid vendorId)
        {
            return Ok(await _financeService.GetBalanceAsync(vendorId));
        }

        [HttpGet("transactions")]
        public async Task<ActionResult> GetTransactions(Guid vendorId, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            var txs = await _financeService.GetTransactionsAsync(vendorId, from, to);
            return Ok(txs);
        }

        [HttpPost("transactions")]
        public async Task<ActionResult<VendorTransactionDto>> CreateTransaction(Guid vendorId, CreateVendorTransactionRequest request)
        {
            var tx = await _financeService.CreateTransactionAsync(vendorId, request);
            return CreatedAtAction(nameof(GetTransactions), new { vendorId }, tx);
        }

        [HttpPut("transactions/{txId:guid}")]
        public async Task<ActionResult<VendorTransactionDto>> UpdateTransaction(Guid vendorId, Guid txId, UpdateVendorTransactionRequest request)
        {
            return Ok(await _financeService.UpdateTransactionAsync(vendorId, txId, request));
        }

        [HttpDelete("transactions/{txId:guid}")]
        public async Task<IActionResult> DeleteTransaction(Guid vendorId, Guid txId)
        {
            await _financeService.DeleteTransactionAsync(vendorId, txId);
            return NoContent();
        }
    }
}
