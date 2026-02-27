using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieRating.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminDashboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HomeSections_Genres_GenreId",
                table: "HomeSections");

            migrationBuilder.DropIndex(
                name: "IX_HomeSections_GenreId",
                table: "HomeSections");

            migrationBuilder.DropColumn(
                name: "GenreId",
                table: "HomeSections");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "HomeSections");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "HomeSectionMovies");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "HomeSections",
                newName: "IsHidden");

            migrationBuilder.RenameColumn(
                name: "DisplayOrder",
                table: "HomeSections",
                newName: "SortBy");

            migrationBuilder.AddColumn<bool>(
                name: "IncludeMovies",
                table: "HomeSections",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeShows",
                table: "HomeSections",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MediaLimit",
                table: "HomeSections",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "HomeSectionShows",
                columns: table => new
                {
                    HomeSectionId = table.Column<int>(type: "int", nullable: false),
                    ShowId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeSectionShows", x => new { x.HomeSectionId, x.ShowId });
                    table.ForeignKey(
                        name: "FK_HomeSectionShows_HomeSections_HomeSectionId",
                        column: x => x.HomeSectionId,
                        principalTable: "HomeSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HomeSectionShows_Shows_ShowId",
                        column: x => x.ShowId,
                        principalTable: "Shows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HomeSectionShows_ShowId",
                table: "HomeSectionShows",
                column: "ShowId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomeSectionShows");

            migrationBuilder.DropColumn(
                name: "IncludeMovies",
                table: "HomeSections");

            migrationBuilder.DropColumn(
                name: "IncludeShows",
                table: "HomeSections");

            migrationBuilder.DropColumn(
                name: "MediaLimit",
                table: "HomeSections");

            migrationBuilder.RenameColumn(
                name: "SortBy",
                table: "HomeSections",
                newName: "DisplayOrder");

            migrationBuilder.RenameColumn(
                name: "IsHidden",
                table: "HomeSections",
                newName: "IsActive");

            migrationBuilder.AddColumn<int>(
                name: "GenreId",
                table: "HomeSections",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "HomeSections",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "HomeSectionMovies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_HomeSections_GenreId",
                table: "HomeSections",
                column: "GenreId");

            migrationBuilder.AddForeignKey(
                name: "FK_HomeSections_Genres_GenreId",
                table: "HomeSections",
                column: "GenreId",
                principalTable: "Genres",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
