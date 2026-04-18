using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Models.DTOs;
using Inventor.Api.Models.Entities;
using Inventor.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Inventor.Api.Models.Mapper;
using Inventor.Api.Exceptions;

namespace Inventor.Api.Services
{
    public class ProcessService : IProcessService
    {
        private readonly InventoryDbContext _context;
        private readonly ILedgerService _ledgerService;
        private readonly ILogger _logger;

        public ProcessService(InventoryDbContext context, ILedgerService ledgerService, ILogger<IProcessService> logger)
        {
            _context = context;
            _ledgerService = ledgerService;
            _logger = logger;
        }

        public async Task<ProcessDefinitionDto> CreateDefinitionAsync(CreateProcessDefinitionRequest request)
        {
            var definition = new ProcessDefinition
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                TenantId = "" // Handled by SaveChanges
            };

            _context.ProcessDefinitions.Add(definition);
            await _context.SaveChangesAsync();

            // return new ProcessDefinitionDto
            // {
            //     Id = definition.Id,
            //     Name = definition.Name,
            //     Description = definition.Description
            // };
            return definition.ToDto();
        }

        public async Task<ProcessDefinitionVersionDto> CreateVersionAsync(Guid definitionId, CreateProcessVersionRequest request)
        {
            var maxVersion = await _context.ProcessDefinitionVersions
                .Where(v => v.ProcessDefinitionId == definitionId)
                .Select(v => (int?)v.VersionNumber)
                .MaxAsync() ?? 0;

            var version = new ProcessDefinitionVersion
            {
                Id = Guid.NewGuid(),
                ProcessDefinitionId = definitionId,
                VersionNumber = maxVersion + 1,
                Status = VersionStatus.ACTIVE,
                EffectiveFrom = DateTime.UtcNow,
                IOs = request.IOs.Select(io => new ProcessIODefinition
                {
                    Id = Guid.NewGuid(),
                    ProductId = io.ProductId,
                    Direction = io.Direction,
                    StandardQty = io.StandardQty,
                    UOM = io.UOM,
                    ScrapPercentage = io.ScrapPercentage
                }).ToList(),
                Costs = request.Costs.Select(cost => new ProcessCostDefinition
                {
                    Id = Guid.NewGuid(),
                    CostType = cost.CostType,
                    Rate = cost.Rate,
                    UOM = cost.UOM
                }).ToList(),
                Notes = request.Notes
            };

            _context.ProcessDefinitionVersions.Add(version);
            await _context.SaveChangesAsync();

            // return new ProcessDefinitionVersionDto
            // {
            //     Id = version.Id,
            //     VersionNumber = version.VersionNumber,
            //     Status = version.Status,
            //     IsUsed = false
            // };
            return version.ToDto();
        }

        public async Task<ProcessDefinitionVersionDto> UpdateVersionAsync(Guid definitionId, Guid versionId, CreateProcessVersionRequest request)
        {
            var version = await _context.ProcessDefinitionVersions
                .Include(v => v.IOs)
                .Include(v => v.Costs)
                .FirstOrDefaultAsync(v => v.Id == versionId && v.ProcessDefinitionId == definitionId);

             if (version == null) 
                throw new NotFoundException("Revision not found");

            //var isUsed = await _context.ProcessExecutions.AnyAsync(x => x.ProcessDefinitionVersionId == versionId);
            if (version.IsUsed) 
                throw new BadRequestException("Cannot update a revision that has already been used in a Job Order");

            // 1. Remove existing IOs and Costs
            _context.ProcessIODefinitions.RemoveRange(version.IOs);
            _context.ProcessCostDefinitions.RemoveRange(version.Costs);
         
            // 2. Add new children explicitly
            _context.ProcessCostDefinitions.AddRange(
                request.Costs.Select(cost => new ProcessCostDefinition
                {
                    Id = Guid.NewGuid(),
                    TenantId = version.TenantId,
                    ProcessDefinitionVersionId = version.Id,
                    CostType = cost.CostType,
                    Rate = cost.Rate,
                    UOM = cost.UOM
                })
            );

            _context.ProcessIODefinitions.AddRange(
                request.IOs.Select(io => new ProcessIODefinition
                {
                    Id = Guid.NewGuid(),
                    TenantId = version.TenantId,
                    ProcessDefinitionVersionId = version.Id,
                    ProductId = io.ProductId,
                    Direction = io.Direction,
                    StandardQty = io.StandardQty,
                    UOM = io.UOM,
                    ScrapPercentage = io.ScrapPercentage
                })
            );

            version.Notes = request.Notes;

            // 3. Save inserts
            await _context.SaveChangesAsync();       

            // return new ProcessDefinitionVersionDto
            // {
            //     Id = version.Id,
            //     VersionNumber = version.VersionNumber,
            //     Status = version.Status,
            //     IsUsed = false          
            // };
            return version.ToDto();
        }

        public async Task<ProcessDefinitionVersionDto> RetireVersionAsync(Guid definitionId, Guid versionId)
        {
            var version = await _context.ProcessDefinitionVersions
                .FirstOrDefaultAsync(v => v.Id == versionId && v.ProcessDefinitionId == definitionId);

            if (version == null) 
                throw new NotFoundException("Revision not found");

            if (version.Status == VersionStatus.RETIRED) 
                throw new BadRequestException("Revision is already retired");

            version.Status = VersionStatus.RETIRED;
            version.EffectiveTo = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return version.ToDto();
        }

        public async Task<string> DeleteVersionAsync(Guid definitionId, Guid versionId)
        {
            var version = await _context.ProcessDefinitionVersions
                .FirstOrDefaultAsync(v => v.Id == versionId && v.ProcessDefinitionId == definitionId);

            if (version == null) 
                throw new NotFoundException("Revision not found");

            //var isUsed = await _context.ProcessExecutions.AnyAsync(x => x.ProcessDefinitionVersionId == versionId);
            if (version.IsUsed) 
                throw new BadRequestException("Cannot delete a revision that has already been used in a Job Order");

            // Cascade delete will handle IOs and Costs automatically since FKs are non-nullable
            _context.ProcessDefinitionVersions.Remove(version);
            await _context.SaveChangesAsync();
            
            return "Revision deleted successfully";
        }

        public async Task<ProcessExecutionDto> CreateExecutionAsync(CreateProcessExecutionRequest request)
        {
            var version = await _context.ProcessDefinitionVersions
                .Include(v => v.IOs)
                    .ThenInclude(io => io.Product)
                        .ThenInclude(p => p!.Costs)
                .FirstOrDefaultAsync(v => v.Id == request.ProcessDefinitionVersionId);

            if (version == null) 
                throw new NotFoundException("Revision not found");

            if (version.Status == VersionStatus.RETIRED) 
                throw new BadRequestException("Revision is retired, cannot create execution");
            
            // mark used to not get modified furthur
            version.IsUsed = true;

            var execution = new ProcessExecution
            {
                Id = Guid.NewGuid(),
                TenantId = "", // Handled by SaveChanges
                ProcessDefinitionVersionId = version.Id,
                PlannedQty = request.PlannedQty,
                Status = ExecutionStatus.DRAFT,
                StartedAt = DateTime.UtcNow,
                IOs = version.IOs.Select(io => new ProcessExecutionIO
                {
                    Id = Guid.NewGuid(),
                    ProductId = io.ProductId,
                    Direction = io.Direction,
                    PlannedQty = io.StandardQty * request.PlannedQty,
                    ActualQty = 0,
                    UnitCost = io.Product?.GetAggregateCost() ?? 0
                }).ToList()
            };

            _context.ProcessExecutions.Add(execution);
            await _context.SaveChangesAsync();

            // return new ProcessExecutionDto
            // {
            //     Id = execution.Id,
            //     ProcessDefinitionVersionId = execution.ProcessDefinitionVersionId,
            //     Status = execution.Status,
            //     PlannedQty = execution.PlannedQty
            // };
            return execution.ToDto();
        }

        public async Task<ProcessExecutionDto> TransitionStatusAsync(Guid executionId, TransitionProcessExecutionRequest request)
        {
            var nextStatus = request.NextStatus;
            var execution = await _context.ProcessExecutions
                .Include(x => x.IOs)
                .ThenInclude(io => io.Product)
                .Include(x => x.ProcessDefinitionVersion)
                .ThenInclude(v => v!.Costs)
                .Include(x => x.Costs)
                .FirstOrDefaultAsync(x => x.Id == executionId);

            if (execution == null) throw new Exception("Execution not found");

            if (execution.Status == ExecutionStatus.COMPLETED) throw new Exception("Already completed");

            execution.Status = nextStatus;

            if (nextStatus == ExecutionStatus.COMPLETED)
            {
                // Use a transaction and async save to ensure tenant population and atomicity
                await using var tx = await _context.Database.BeginTransactionAsync();
                try
                {
                execution.CompletedAt = DateTime.UtcNow;
                
                // 1. Calculate Costs (Roll-up)
                double totalInputCost = 0;
                
                foreach (var io in execution.IOs.Where(i => i.Direction == IODirection.IN))
                {
                        //var latestLedgerEntry = await _context.InventoryLedgers
                        //    .Where(l => l.ProductId == io.ProductId && l.Direction == LedgerDirection.IN)
                        //    .OrderByDescending(l => l.CreatedAt)
                        //    .FirstOrDefaultAsync();

                        //double unitCost = latestLedgerEntry?.UnitCost ?? 0;
                        //io.UnitCost = unitCost;
                    io.ActualQty = io.PlannedQty; // Assuming planned = actual for inputs for now
                    io.ActualCost = (double) io.ActualQty * io.UnitCost;
                    totalInputCost += io.ActualCost;
                }

                // Processing costs like Labor, Electricity, Transport etc.
                if (execution.ProcessDefinitionVersion != null)
                {
                    foreach (var processingCostDef in execution.ProcessDefinitionVersion.Costs)
                    {
                        double costTotal = processingCostDef.Rate * (double)execution.PlannedQty;
                        totalInputCost += costTotal;

                        _context.ProcessExecutionCosts.Add(new ProcessExecutionCost
                        {
                            Id = Guid.NewGuid(),
                                TenantId = execution.TenantId,
                            ProcessExecutionId = execution.Id,
                            CostType = processingCostDef.CostType,
                            Rate = processingCostDef.Rate,
                            Quantity = execution.PlannedQty,
                            TotalCost = costTotal
                        });
                        //await _context.ProcessExecutionCosts.AddRangeAsync(processExecutionCosts);
                    }
                }

                double outputUnitCost = execution.PlannedQty > 0 ? totalInputCost / (double)execution.PlannedQty : 0;
                double outputUnitCostXproduceQuantitySum = execution.IOs.Aggregate(0.0, ( x ,io) =>{
                    if(io.Direction == IODirection.OUT)
                    { 
                        double ioReqQty = execution.PlannedQty > 0 ? (double)io.PlannedQty / (double)execution.PlannedQty : 1.0;
                        return x + ioReqQty * (double)io.UnitCost;
                    }
                    return x;
                });
                double unitCostCorrectionMultiplier = (double) outputUnitCost / outputUnitCostXproduceQuantitySum;

                // 2. Automate Ledger Entries via LedgerService
                decimal actualOutputSum = 0;
                foreach (var io in execution.IOs)
                {
                    bool isOutput = io.Direction == IODirection.OUT;
                    if (isOutput)
                    {
                        var ioReqQty = execution.PlannedQty > 0 ? io.PlannedQty / execution.PlannedQty : 1;
                        // Scrap should relative to required quantity
                        io.ActualQty = Math.Max(0, io.PlannedQty - ioReqQty * request.ScrapQty);
                        io.UnitCost = io.UnitCost * unitCostCorrectionMultiplier;
                        io.ActualCost = (double) io.ActualQty * io.UnitCost;
                        actualOutputSum += io.ActualQty;
                    }

                    await _ledgerService.CreateEntryAsync(
                        io.ProductId, 
                        io.ActualQty, 
                        io.Product?.UOM ?? "Units",
                        isOutput ? "IN" : "OUT", 
                        $"PROCESS_EXECUTION_{nextStatus}",
                        io.UnitCost,
                        execution.Id
                    );
                }
                execution.ActualOutputQty = execution.PlannedQty - request.ScrapQty;
                execution.ScrapQty = request.ScrapQty;
                execution.TotalCost = totalInputCost;

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                }
                catch
                {
                    await tx.RollbackAsync();
                    throw;
                }
            }

            await _context.SaveChangesAsync();

            // return new ProcessExecutionDto
            // {
            //     Id = execution.Id,
            //     ProcessDefinitionVersionId = execution.ProcessDefinitionVersionId,
            //     Status = execution.Status,
            //     PlannedQty = execution.PlannedQty,
            //     ActualOutputQty = execution.ActualOutputQty,
            //     ScrapQty = execution.ScrapQty
            // };
            return execution.ToDto();
        }

        public async Task<IEnumerable<ProcessDefinitionDto>> GetDefinitionsAsync()
        {
            return await _context.ProcessDefinitions
                .Include(d => d.Versions)
                    .ThenInclude(v => v.IOs)
                        .ThenInclude(io => io.Product)
                .Include(d => d.Versions)
                    .ThenInclude(v => v.Costs)
                // .Select(d => new ProcessDefinitionDto
                // {
                //     Id = d.Id,
                //     Name = d.Name,
                //     Description = d.Description,
                //     Versions = d.Versions.Select(v => new ProcessDefinitionVersionDto
                //     {
                //         Id = v.Id,
                //         VersionNumber = v.VersionNumber,
                //         Status = v.Status,
                //         IsUsed = _context.ProcessExecutions.Any(x => x.ProcessDefinitionVersionId == v.Id),
                //         IOs = v.IOs.Select(io => new ProcessIODefinitionDto
                //         {
                //             Id = io.Id,
                //             ProductId = io.ProductId,
                //             Product = new ProductDto
                //             {
                //                 Id = io.Product!.Id,
                //                 Code = io.Product.Code,
                //                 Name = io.Product.Name,
                //                 ProductType = io.Product.ProductType,
                //                 UOM = io.Product.UOM,
                //                 CurrentQuantity = io.Product.CurrentQuantity
                //             },
                //             Direction = io.Direction,
                //             StandardQty = io.StandardQty,
                //             UOM = io.UOM
                //         }).ToList(),
                //         Costs = v.Costs.Select(c => new ProcessCostDefinitionDto
                //         {
                //             Id = c.Id,
                //             CostType = c.CostType,
                //             Rate = c.Rate,
                //             UOM = c.UOM
                //         }).ToList()
                //     }).ToList()
                // })
                .Select(d => d.ToDto())
                .ToListAsync();
        }

        public async Task<ProcessDefinitionDto?> GetDefinitionAsync(Guid id)
        {
            var def = await _context.ProcessDefinitions
                .Include(d => d.Versions)
                    .ThenInclude(v => v.IOs)
                        .ThenInclude(io=>io.Product!)
                            .ThenInclude(p => p.Costs)
                .Include(d => d.Versions)
                    .ThenInclude(v => v.IOs)
                        .ThenInclude(io => io.Product!)
                            .ThenInclude(p => p.Prices)
                .Include(d => d.Versions)
                    .ThenInclude(v => v.Costs)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (def == null) return null;

            //return new ProcessDefinitionDto
            //{
            //    Id = def.Id,
            //    Name = def.Name,
            //    Description = def.Description,
            //    Versions = def.Versions.Select(v =>
            //    {
            //        var isUsed = _context.ProcessExecutions.Any(x => x.ProcessDefinitionVersionId == v.Id);
            //        return new ProcessDefinitionVersionDto
            //        {
            //            Id = v.Id,
            //            VersionNumber = v.VersionNumber,
            //            Status = v.Status,
            //            IsUsed = isUsed,
            //            IOs = v.IOs.Select(io => new ProcessIODefinitionDto
            //            {
            //                Id = io.Id,
            //                ProductId = io.ProductId,
            //                Product = new ProductDto
            //                {
            //                    Id = io.Product!.Id,
            //                    Code = io.Product.Code,
            //                    Name = io.Product.Name,
            //                    ProductType = io.Product.ProductType,
            //                    UOM = io.Product.UOM,
            //                    CurrentQuantity = io.Product.CurrentQuantity
            //                },
            //                Direction = io.Direction,
            //                StandardQty = io.StandardQty,
            //                UOM = io.UOM
            //            }).ToList(),
            //            Costs = v.Costs.Select(c => new ProcessCostDefinitionDto
            //            {
            //                Id = c.Id,
            //                CostType = c.CostType,
            //                Rate = c.Rate,
            //                UOM = c.UOM
            //            }).ToList()
            //        };
            //    }).ToList()
            //};
            return def.ToDto();
        }

        public async Task<IEnumerable<ProcessExecutionDto>> GetExecutionsAsync()
        {
            var executions = _context.ProcessExecutions
                .Include(x => x.IOs)
                .Include(x => x.ProcessDefinitionVersion)
                .Include(x => x.ProcessDefinitionVersion)
                    .ThenInclude(v => v!.ProcessDefinition)
                .OrderByDescending(x => x.StartedAt);
            //ProcessDefinitionVersion? version = execution.ProcessDefinitionVersion;
            return executions.Select(x => new ProcessExecutionDto
            {
                Id = x.Id,
                ProcessDefinitionVersionId = x.ProcessDefinitionVersionId,
                ProcessDefinitionVersion = x.ProcessDefinitionVersion == null ? new() : new ProcessDefinitionVersionDto
                {
                    Id = x.ProcessDefinitionVersion.Id,
                    VersionNumber = x.ProcessDefinitionVersion.VersionNumber,
                    Status = x.ProcessDefinitionVersion.Status,
                    ProcessDefinitionId = x.ProcessDefinitionVersion.ProcessDefinitionId,
                    ProcessDefinition = x.ProcessDefinitionVersion.ProcessDefinition == null ? null : new ProcessDefinitionDto
                    {
                        Id = x.ProcessDefinitionVersion.ProcessDefinition.Id,
                        Name = x.ProcessDefinitionVersion.ProcessDefinition.Name,
                        Description = x.ProcessDefinitionVersion.ProcessDefinition.Description
                    },
                    IsUsed = x.ProcessDefinitionVersion.IsUsed,
                    EffectiveFrom = x.ProcessDefinitionVersion.EffectiveFrom,
                    EffectiveTo = x.ProcessDefinitionVersion.EffectiveTo,
                    Notes = x.ProcessDefinitionVersion.Notes,
                    IOs = x.ProcessDefinitionVersion.IOs.Select(io => io.ToDto()).ToList(),
                    Costs = x.ProcessDefinitionVersion.Costs.Select(c => c.ToDto()).ToList()
                },
                VendorId = x.VendorId,
                PlannedQty = x.PlannedQty,
                ActualOutputQty = x.ActualOutputQty,
                ScrapQty = x.ScrapQty,
                TotalCost = x.TotalCost,
                Status = x.Status,
                StartedAt = x.StartedAt,
                CompletedAt = x.CompletedAt,
                IOs = x.IOs.Select(io => io.ToDto()).ToList(),
                Costs = x.Costs.Select(c => c.ToDto()).ToList()
            });
        }

        public async Task<ProcessExecutionDto?> GetExecutionAsync(Guid id)
        {
            var execution = await _context.ProcessExecutions
                .Include(x => x.IOs)
                    .ThenInclude(io => io.Product)
                .Include(x => x.ProcessDefinitionVersion)
                .Include(x => x.ProcessDefinitionVersion)
                    .ThenInclude(v => v!.ProcessDefinition)
                .Include(x => x.Costs)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (execution == null) return null;

            ProcessDefinitionVersion? version = execution.ProcessDefinitionVersion;
            return new ProcessExecutionDto
            {
                Id = execution.Id,
                ProcessDefinitionVersionId = execution.ProcessDefinitionVersionId,
                ProcessDefinitionVersion = version == null ? new() : new ProcessDefinitionVersionDto
                {
                    Id = version.Id,
                    VersionNumber = version.VersionNumber,
                    Status = version.Status,
                    ProcessDefinitionId = version.ProcessDefinitionId,
                    ProcessDefinition = version.ProcessDefinition == null ? null : new ProcessDefinitionDto
                    { 
                        Id = version.ProcessDefinition.Id,
                        Name = version.ProcessDefinition.Name,
                        Description = version.ProcessDefinition.Description
                    },
                    IsUsed = version.IsUsed,
                    EffectiveFrom = version.EffectiveFrom,
                    EffectiveTo = version.EffectiveTo,
                    Notes = version.Notes,
                    IOs = version.IOs.Select(io => io.ToDto()).ToList(),
                    Costs = version.Costs.Select(c => c.ToDto()).ToList()
                },
                VendorId = execution.VendorId,
                PlannedQty = execution.PlannedQty,
                ActualOutputQty = execution.ActualOutputQty,
                ScrapQty = execution.ScrapQty,
                TotalCost = execution.TotalCost,
                Status = execution.Status,
                StartedAt = execution.StartedAt,
                CompletedAt = execution.CompletedAt,
                IOs = execution.IOs.Select(io => io.ToDto()).ToList(),
                Costs = execution.Costs.Select(c => c.ToDto()).ToList()
            };
            //return execution.ToDto();
        }
    }
}

