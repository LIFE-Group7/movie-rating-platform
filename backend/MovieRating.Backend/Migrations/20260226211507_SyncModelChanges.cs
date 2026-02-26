using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieRating.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "HomeSectionMovies");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "HomeSectionMovies",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
