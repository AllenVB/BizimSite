using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizimSite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIbanAndDekont : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DekontNote",
                table: "Payments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DekontUrl",
                table: "Payments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountHolder",
                table: "AidatConfigs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IbanNo",
                table: "AidatConfigs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DekontNote",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "DekontUrl",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "AccountHolder",
                table: "AidatConfigs");

            migrationBuilder.DropColumn(
                name: "IbanNo",
                table: "AidatConfigs");
        }
    }
}
