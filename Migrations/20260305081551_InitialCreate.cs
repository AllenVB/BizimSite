using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizimSite.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Apartments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DaireNo = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Blok = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Kat = table.Column<int>(type: "INTEGER", nullable: false),
                    SahipAdi = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SahipTel = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Aktif = table.Column<bool>(type: "INTEGER", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apartments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Dues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DaireId = table.Column<int>(type: "INTEGER", nullable: false),
                    Yil = table.Column<int>(type: "INTEGER", nullable: false),
                    Ay = table.Column<int>(type: "INTEGER", nullable: false),
                    Tutar = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Odendi = table.Column<bool>(type: "INTEGER", nullable: false),
                    OdemeTarihi = table.Column<DateTime>(type: "TEXT", nullable: true),
                    OdemeSekli = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Aciklama = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dues_Apartments_DaireId",
                        column: x => x.DaireId,
                        principalTable: "Apartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Ad = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Soyad = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Sifre = table.Column<string>(type: "TEXT", nullable: false),
                    Rol = table.Column<int>(type: "INTEGER", nullable: false),
                    DaireId = table.Column<int>(type: "INTEGER", nullable: true),
                    Aktif = table.Column<bool>(type: "INTEGER", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Apartments_DaireId",
                        column: x => x.DaireId,
                        principalTable: "Apartments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Baslik = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Icerik = table.Column<string>(type: "TEXT", nullable: false),
                    YayinTarihi = table.Column<DateTime>(type: "TEXT", nullable: false),
                    BitisTarihi = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Aktif = table.Column<bool>(type: "INTEGER", nullable: false),
                    Oncelikli = table.Column<bool>(type: "INTEGER", nullable: false),
                    OlusturanKullaniciId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Announcements_Users_OlusturanKullaniciId",
                        column: x => x.OlusturanKullaniciId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Kategori = table.Column<int>(type: "INTEGER", nullable: false),
                    Tutar = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Aciklama = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Tarih = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Firma = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    FaturaNo = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "TEXT", nullable: false),
                    OlusturanKullaniciId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Users_OlusturanKullaniciId",
                        column: x => x.OlusturanKullaniciId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_OlusturanKullaniciId",
                table: "Announcements",
                column: "OlusturanKullaniciId");

            migrationBuilder.CreateIndex(
                name: "IX_Apartments_DaireNo",
                table: "Apartments",
                column: "DaireNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dues_DaireId_Yil_Ay",
                table: "Dues",
                columns: new[] { "DaireId", "Yil", "Ay" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_OlusturanKullaniciId",
                table: "Expenses",
                column: "OlusturanKullaniciId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_DaireId",
                table: "Users",
                column: "DaireId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "Dues");

            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Apartments");
        }
    }
}
