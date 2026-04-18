using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddedNeColumnFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProcessExecutionId",
                table: "InventoryLedgers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryLedgers_ProcessExecutionId",
                table: "InventoryLedgers",
                column: "ProcessExecutionId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryLedgers_ProcessExecutions_ProcessExecutionId",
                table: "InventoryLedgers",
                column: "ProcessExecutionId",
                principalTable: "ProcessExecutions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryLedgers_ProcessExecutions_ProcessExecutionId",
                table: "InventoryLedgers");

            migrationBuilder.DropIndex(
                name: "IX_InventoryLedgers_ProcessExecutionId",
                table: "InventoryLedgers");

            migrationBuilder.DropColumn(
                name: "ProcessExecutionId",
                table: "InventoryLedgers");
        }
    }
}
