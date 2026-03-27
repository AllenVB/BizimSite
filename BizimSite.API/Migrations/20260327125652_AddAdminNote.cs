using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizimSite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "Payments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "Payments");
        }
    }
}
