using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Inventor.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManufacturingController : ControllerBase
    {
        private readonly IProcessService _processService;

        public ManufacturingController(IProcessService processService)
        {
            _processService = processService;
        }

        [HttpPost("definitions")]
        public async Task<ActionResult<ProcessDefinitionDto>> CreateDefinition(CreateProcessDefinitionRequest request)
        {
            var result = await _processService.CreateDefinitionAsync(request);
            return Ok(result);
        }

        [HttpPost("definitions/{id}/versions")]
        public async Task<ActionResult<ProcessDefinitionVersionDto>> CreateVersion(Guid id, CreateProcessVersionRequest request)
        {
            var result = await _processService.CreateVersionAsync(id, request);
            return Ok(result);
        }

        [HttpPut("definitions/{id}/versions/{versionId}")]
        public async Task<ActionResult<ProcessDefinitionVersionDto>> UpdateVersion(Guid id, Guid versionId, CreateProcessVersionRequest request)
        {
            var result = await _processService.UpdateVersionAsync(id, versionId, request);
            return Ok(result);
        }

        [HttpPost("definitions/{id}/versions/{versionId}/retire")]
        public async Task<ActionResult<ProcessDefinitionVersionDto>> RetireVersion(Guid id, Guid versionId)
        {
            var result = await _processService.RetireVersionAsync(id, versionId);
            return Ok(result);
        }

        [HttpDelete("definitions/{id}/versions/{versionId}")]
        public async Task<ActionResult<string>> DeleteVersion(Guid id, Guid versionId)
        {
            var result = await _processService.DeleteVersionAsync(id, versionId);
            return Ok(result);
        }

        [HttpGet("definitions")]
        public async Task<ActionResult<IEnumerable<ProcessDefinitionDto>>> GetDefinitions()
        {
            return Ok(await _processService.GetDefinitionsAsync());
        }

        [HttpGet("definitions/{id}")]
        public async Task<ActionResult<ProcessDefinitionDto>> GetDefinition(Guid id)
        {
            var result = await _processService.GetDefinitionAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("executions")]
        public async Task<ActionResult<ProcessExecutionDto>> CreateExecution(CreateProcessExecutionRequest request)
        {
            var result = await _processService.CreateExecutionAsync(request);
            return Ok(result);
        }

        [HttpGet("executions")]
        public async Task<ActionResult<IEnumerable<ProcessExecutionDto>>> GetExecutions()
        {
            return Ok(await _processService.GetExecutionsAsync());
        }

        [HttpGet("executions/{id}")]
        public async Task<ActionResult<ProcessExecutionDto>> GetExecution(Guid id)
        {
            var result = await _processService.GetExecutionAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("executions/{id}/transition")]
        public async Task<ActionResult<ProcessExecutionDto>> TransitionExecution(Guid id, [FromBody] TransitionProcessExecutionRequest request)
        {
            var result = await _processService.TransitionStatusAsync(id, request);
            return Ok(result);
        }
    }
}
