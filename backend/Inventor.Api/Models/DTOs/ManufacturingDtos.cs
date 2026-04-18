using Inventor.Api.Models.Entities;
using Inventor.Api.Models.Enums;
using System;
using System.Collections.Generic;

namespace Inventor.Api.Models.DTOs
{
    public class ProcessDefinitionDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public List<ProcessDefinitionVersionDto> Versions { get; set; } = new();
    }

    public class CreateProcessDefinitionRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class ProcessDefinitionVersionDto
    {
        public Guid Id { get; set; }
        public int VersionNumber { get; set; }
        public VersionStatus Status { get; set; }
        public Guid ProcessDefinitionId { get; set; }
        public ProcessDefinitionDto? ProcessDefinition { get; set; }
        public bool IsUsed { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? Notes { get; set; }
        public List<ProcessIODefinitionDto> IOs { get; set; } = new();
        public List<ProcessCostDefinitionDto> Costs { get; set; } = new();
    }

    public class CreateProcessVersionRequest
    {
        public List<ProcessIODefinitionDto> IOs { get; set; } = new();
        public List<ProcessCostDefinitionDto> Costs { get; set; } = new();
        public string? Notes { get; set; }

    }

    public class ProcessIODefinitionDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public ProductDto? Product { get; set; }
        public IODirection Direction { get; set; }
        public decimal StandardQty { get; set; }
        public string UOM { get; set; } = string.Empty;
        public decimal ScrapPercentage { get; set; }
    }

    public class ProcessCostDefinitionDto
    {
        public Guid Id { get; set; }
        public CostType CostType { get; set; }
        public double Rate { get; set; }
        public string UOM { get; set; } = string.Empty;
    }

    public class ProcessExecutionCostDto
    {
        public Guid Id { get; set; }
        public CostType CostType { get; set; }
        public double Rate { get; set; }
        public decimal Quantity { get; set; }
        public double TotalCost { get; set; }
    }

    public class ProcessExecutionDto
    {
        public Guid Id { get; set; }
        public Guid ProcessDefinitionVersionId { get; set; }
        public ProcessDefinitionVersionDto ProcessDefinitionVersion { get; set; } = new();
        public Guid? VendorId { get; set; }
        public decimal PlannedQty { get; set; }
        public decimal ActualOutputQty { get; set; }
        public decimal ScrapQty { get; set; }
        public double TotalCost { get; set; }
        public ExecutionStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public ICollection<ProcessExecutionIODto> IOs { get; set; } = [];
        public ICollection<ProcessExecutionCostDto> Costs { get; set; } = [];
    }

    public class ProcessExecutionIODto
    {
        public Guid Id { get; set; }
        public Guid ProcessExecutionId { get; set; }
        public Guid ProductId { get; set; }
        public ProductDto? Product { get; set; }
        public IODirection Direction { get; set; }
        public decimal PlannedQty { get; set; }
        public decimal ActualQty { get; set; }
        public double UnitCost { get; set; }
        public double ActualCost { get; set; }
    }

    public class CreateProcessExecutionRequest
    {
        public Guid ProcessDefinitionVersionId { get; set; }
        public decimal PlannedQty { get; set; }
    }

    public class TransitionProcessExecutionRequest
    {
        public ExecutionStatus NextStatus { get; set; }
        public decimal ScrapQty { get; set; }
        public string? Notes { get; set; }
    }
}
