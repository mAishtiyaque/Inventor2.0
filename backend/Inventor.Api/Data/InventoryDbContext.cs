using Microsoft.EntityFrameworkCore;
using Inventor.Api.Models.Entities;
using Inventor.Api.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inventor.Api.Data
{
    public class InventoryDbContext : DbContext
    {
        private readonly ITenantProvider _tenantProvider;

        public InventoryDbContext(DbContextOptions<InventoryDbContext> options, ITenantProvider tenantProvider) 
            : base(options) 
        {
            _tenantProvider = tenantProvider;
        }
        public string TenantId => _tenantProvider.GetTenantId() ?? "";

        public DbSet<Product> Products { get; set; }
        public DbSet<InventoryLedger> InventoryLedgers { get; set; }
        public DbSet<ProcessDefinition> ProcessDefinitions { get; set; }
        public DbSet<ProcessDefinitionVersion> ProcessDefinitionVersions { get; set; }
        public DbSet<ProcessIODefinition> ProcessIODefinitions { get; set; }
        public DbSet<ProcessCostDefinition> ProcessCostDefinitions { get; set; }
        public DbSet<ProcessExecution> ProcessExecutions { get; set; }
        public DbSet<ProcessExecutionIO> ProcessExecutionIOs { get; set; }
        public DbSet<ProcessExecutionCost> ProcessExecutionCosts { get; set; }
        public DbSet<ProductCost> ProductCosts { get; set; }
        public DbSet<ProductPrice> ProductPrices { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<VendorTransaction> VendorTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //var tenantId = _tenantProvider.GetTenantId();

            // Configure Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
                entity.HasQueryFilter(p => p.TenantId == TenantId);
            });

            // Configure InventoryLedger
            modelBuilder.Entity<InventoryLedger>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId);
                entity.HasQueryFilter(l => l.TenantId == TenantId);
            });

            // Configure ProcessDefinition
            modelBuilder.Entity<ProcessDefinition>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasQueryFilter(d => d.TenantId == TenantId);
            });

            // Configure ProcessExecution
            modelBuilder.Entity<ProcessExecution>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Vendor)
                    .WithMany(p => p.ProcessExecutions)
                    .HasForeignKey(e => e.VendorId)
                    .IsRequired(false);
                entity.HasQueryFilter(x => x.TenantId == TenantId);
            });

            // Configure Vendor
            modelBuilder.Entity<Vendor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
                entity.HasQueryFilter(p => p.TenantId == TenantId);
            });

            // Configure ProcessDefinitionVersion
            modelBuilder.Entity<ProcessDefinitionVersion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ProcessDefinition)
                    .WithMany(d => d.Versions)
                    .HasForeignKey(e => e.ProcessDefinitionId);
                entity.HasQueryFilter(v => v.TenantId == TenantId);
            });

            // Configure ProcessIODefinition
            modelBuilder.Entity<ProcessIODefinition>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ProcessDefinitionVersion)
                    .WithMany(v => v.IOs)
                    .HasForeignKey(e => e.ProcessDefinitionVersionId);
                entity.HasQueryFilter(io => io.TenantId == TenantId);
            });

            // Configure ProcessCostDefinition
            modelBuilder.Entity<ProcessCostDefinition>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ProcessDefinitionVersion)
                    .WithMany(v => v.Costs)
                    .HasForeignKey(e => e.ProcessDefinitionVersionId);
                entity.HasQueryFilter(c => c.TenantId == TenantId);
            });

            // Configure ProcessExecutionIO
            modelBuilder.Entity<ProcessExecutionIO>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ProcessExecution)
                    .WithMany(x => x.IOs)
                    .HasForeignKey(e => e.ProcessExecutionId);
                entity.HasQueryFilter(io => io.TenantId == TenantId);
            });

            // Configure ProcessExecutionCost
            modelBuilder.Entity<ProcessExecutionCost>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ProcessExecution)
                    .WithMany(x => x.Costs)
                    .HasForeignKey(e => e.ProcessExecutionId);
                entity.HasQueryFilter(c => c.TenantId == TenantId);
            });

            // Configure ProductCost
            modelBuilder.Entity<ProductCost>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Product)
                    .WithMany(p => p.Costs)
                    .HasForeignKey(e => e.ProductId);
                entity.HasQueryFilter(c => c.TenantId == TenantId);
            });

            // Configure ProductPrice
            modelBuilder.Entity<ProductPrice>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Product)
                    .WithMany(p => p.Prices)
                    .HasForeignKey(e => e.ProductId);
                entity.HasQueryFilter(p => p.TenantId == TenantId);
            });

            // Configure VendorTransaction
            modelBuilder.Entity<VendorTransaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Vendor)
                    .WithMany()
                    .HasForeignKey(e => e.VendorId);
                entity.HasQueryFilter(t => t.TenantId == TenantId);
            });
        }


        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            //var tenantId = _tenantProvider.GetTenantId();
            if (string.IsNullOrEmpty(TenantId))
            {
                throw new InvalidOperationException("Tenant ID is missing in the current context.");
            }

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added)
                {
                    var property = entry.Metadata.FindProperty("TenantId");
                    if (property != null)
                    {
                        entry.Property("TenantId").CurrentValue = TenantId;
                    }
                } else if (entry.State == EntityState.Modified)
                {
                    entry.Property("TenantId").IsModified = false;
                    var originalTenant = entry.OriginalValues.GetValue<string>("TenantId");
                    if (originalTenant != TenantId)
                    {
                        throw new InvalidOperationException(
                            "Cross-tenant update detected.");
                    }
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}

