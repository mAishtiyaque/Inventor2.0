using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventor.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcessDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ProductType = table.Column<int>(type: "integer", nullable: false),
                    UOM = table.Column<string>(type: "text", nullable: false),
                    CurrentQuantity = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessDefinitionVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessDefinitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessDefinitionVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessDefinitionVersions_ProcessDefinitions_ProcessDefinit~",
                        column: x => x.ProcessDefinitionId,
                        principalTable: "ProcessDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryLedgers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "text", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    UOM = table.Column<string>(type: "text", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryLedgers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryLedgers_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessCostDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessDefinitionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CostType = table.Column<int>(type: "integer", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric", nullable: false),
                    UOM = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessCostDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessCostDefinitions_ProcessDefinitionVersions_ProcessDef~",
                        column: x => x.ProcessDefinitionVersionId,
                        principalTable: "ProcessDefinitionVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessExecutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "text", nullable: false),
                    ProcessDefinitionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    VendorId = table.Column<Guid>(type: "uuid", nullable: true),
                    PlannedQty = table.Column<decimal>(type: "numeric", nullable: false),
                    ActualOutputQty = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessExecutions_ProcessDefinitionVersions_ProcessDefiniti~",
                        column: x => x.ProcessDefinitionVersionId,
                        principalTable: "ProcessDefinitionVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessIODefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessDefinitionVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    StandardQty = table.Column<decimal>(type: "numeric", nullable: false),
                    UOM = table.Column<string>(type: "text", nullable: true),
                    ScrapPercentage = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessIODefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessIODefinitions_ProcessDefinitionVersions_ProcessDefin~",
                        column: x => x.ProcessDefinitionVersionId,
                        principalTable: "ProcessDefinitionVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcessIODefinitions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessExecutionIOs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessExecutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    PlannedQty = table.Column<decimal>(type: "numeric", nullable: false),
                    ActualQty = table.Column<decimal>(type: "numeric", nullable: false),
                    ActualCost = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessExecutionIOs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessExecutionIOs_ProcessExecutions_ProcessExecutionId",
                        column: x => x.ProcessExecutionId,
                        principalTable: "ProcessExecutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcessExecutionIOs_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryLedgers_ProductId",
                table: "InventoryLedgers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessCostDefinitions_ProcessDefinitionVersionId",
                table: "ProcessCostDefinitions",
                column: "ProcessDefinitionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessDefinitionVersions_ProcessDefinitionId",
                table: "ProcessDefinitionVersions",
                column: "ProcessDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessExecutionIOs_ProcessExecutionId",
                table: "ProcessExecutionIOs",
                column: "ProcessExecutionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessExecutionIOs_ProductId",
                table: "ProcessExecutionIOs",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessExecutions_ProcessDefinitionVersionId",
                table: "ProcessExecutions",
                column: "ProcessDefinitionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessIODefinitions_ProcessDefinitionVersionId",
                table: "ProcessIODefinitions",
                column: "ProcessDefinitionVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessIODefinitions_ProductId",
                table: "ProcessIODefinitions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Code",
                table: "Products",
                columns: new[] { "TenantId", "Code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventoryLedgers");

            migrationBuilder.DropTable(
                name: "ProcessCostDefinitions");

            migrationBuilder.DropTable(
                name: "ProcessExecutionIOs");

            migrationBuilder.DropTable(
                name: "ProcessIODefinitions");

            migrationBuilder.DropTable(
                name: "ProcessExecutions");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "ProcessDefinitionVersions");

            migrationBuilder.DropTable(
                name: "ProcessDefinitions");
        }
    }
}
