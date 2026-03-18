using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BizimSite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBlocksAndAidatPeriod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PeriodEndDate",
                table: "AidatConfigs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PeriodStartDate",
                table: "AidatConfigs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PreviousEndDate",
                table: "AidatConfigs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviousMonth",
                table: "AidatConfigs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PreviousStartDate",
                table: "AidatConfigs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Blocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Floors = table.Column<int>(type: "integer", nullable: false),
                    ApartmentsPerFloor = table.Column<int>(type: "integer", nullable: false),
                    TotalApartments = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Blocks_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Blocks_TenantId",
                table: "Blocks",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Blocks");

            migrationBuilder.DropColumn(
                name: "PeriodEndDate",
                table: "AidatConfigs");

            migrationBuilder.DropColumn(
                name: "PeriodStartDate",
                table: "AidatConfigs");

            migrationBuilder.DropColumn(
                name: "PreviousEndDate",
                table: "AidatConfigs");

            migrationBuilder.DropColumn(
                name: "PreviousMonth",
                table: "AidatConfigs");

            migrationBuilder.DropColumn(
                name: "PreviousStartDate",
                table: "AidatConfigs");
        }
    }
}
