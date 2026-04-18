using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Enums;

namespace Inventor.Api.Interfaces
{
    public interface IProcessService
    {
        // Definition
        Task<ProcessDefinitionDto> CreateDefinitionAsync(CreateProcessDefinitionRequest request);
        Task<ProcessDefinitionVersionDto> CreateVersionAsync(Guid definitionId, CreateProcessVersionRequest request);
        Task<ProcessDefinitionVersionDto> UpdateVersionAsync(Guid definitionId, Guid versionId, CreateProcessVersionRequest request);
        Task<ProcessDefinitionVersionDto> RetireVersionAsync(Guid definitionId, Guid versionId);
        Task<string> DeleteVersionAsync(Guid definitionId, Guid versionId);
        Task<IEnumerable<ProcessDefinitionDto>> GetDefinitionsAsync();
        Task<ProcessDefinitionDto?> GetDefinitionAsync(Guid id);
        
        // Execution
        Task<ProcessExecutionDto> CreateExecutionAsync(CreateProcessExecutionRequest request);
        Task<ProcessExecutionDto> TransitionStatusAsync(Guid executionId, TransitionProcessExecutionRequest request);
        Task<IEnumerable<ProcessExecutionDto>> GetExecutionsAsync();
        Task<ProcessExecutionDto?> GetExecutionAsync(Guid id);

    }
}
