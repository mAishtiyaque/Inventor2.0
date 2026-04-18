using System.Threading.Tasks;
using Inventor.Api.Models.DTOs;

namespace Inventor.Api.Interfaces
{
    public interface IReportingService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    }
}
