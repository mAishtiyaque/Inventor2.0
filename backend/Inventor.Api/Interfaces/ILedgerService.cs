using System;
using System.Threading.Tasks;
using Inventor.Api.Models.DTOs;

namespace Inventor.Api.Interfaces
{
    public interface ILedgerService
    {
        Task CreateEntryAsync(Guid productId, decimal quantity, string uom, string direction, string eventType, double unitCost = 0, Guid? executionId = null);
    }
}
