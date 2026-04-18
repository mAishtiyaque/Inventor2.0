using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddScrapQtyToExecution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ScrapQty",
                table: "ProcessExecutions",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScrapQty",
                table: "ProcessExecutions");
        }
    }
}
