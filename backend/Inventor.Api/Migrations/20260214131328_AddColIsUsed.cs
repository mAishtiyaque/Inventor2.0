using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddColIsUsed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "ProcessDefinitionVersions",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "ProcessDefinitionVersions");
        }
    }
}
