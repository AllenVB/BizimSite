using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizimSite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBuildingPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BuildingPassword",
                table: "Tenants",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BuildingPassword",
                table: "Tenants");
        }
    }
}
