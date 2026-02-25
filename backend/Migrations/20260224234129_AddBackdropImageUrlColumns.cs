using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieRating.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBackdropImageUrlColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BackdropImageUrl",
                table: "Shows",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BackdropImageUrl",
                table: "Movies",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackdropImageUrl",
                table: "Shows");

            migrationBuilder.DropColumn(
                name: "BackdropImageUrl",
                table: "Movies");
        }
    }
}
