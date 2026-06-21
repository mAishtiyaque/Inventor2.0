using Microsoft.AspNetCore.Mvc;

namespace Inventor.Api.Controllers
{
    [ApiController]
    [Route("")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                Status = "Online",
                Message = "Welcome to Inventor API. The backend is running smoothly. Visit https://localhost:7175/swagger/index.html for API documentation.",
                Timestamp = System.DateTime.UtcNow,
                Version = "1.0.1"
            });
        }
    }
}
