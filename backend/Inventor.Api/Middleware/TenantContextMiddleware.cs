using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Inventor.Api.Interfaces;

namespace Inventor.Api.Middleware
{
    public class TenantContextMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider)
        {
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantId))
            {
                tenantProvider.SetTenantId(tenantId.ToString());
            }

            await _next(context);
        }
    }
}
