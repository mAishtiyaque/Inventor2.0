using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExecutionCostTbl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "UnitCost",
                table: "ProcessExecutionIOs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ProcessExecutionCosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "text", nullable: false),
                    ProcessExecutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CostType = table.Column<int>(type: "integer", nullable: false),
                    Rate = table.Column<decimal>(type: "numeric", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessExecutionCosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessExecutionCosts_ProcessExecutions_ProcessExecutionId",
                        column: x => x.ProcessExecutionId,
                        principalTable: "ProcessExecutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessExecutionCosts_ProcessExecutionId",
                table: "ProcessExecutionCosts",
                column: "ProcessExecutionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessExecutionCosts");

            migrationBuilder.DropColumn(
                name: "UnitCost",
                table: "ProcessExecutionIOs");
        }
    }
}
