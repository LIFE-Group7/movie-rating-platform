using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieRating.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddShowReviewsSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "Reviews",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Reviews",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "ShowId",
                table: "Reviews",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ShowId",
                table: "Reviews",
                column: "ShowId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId_MovieId",
                table: "Reviews",
                columns: new[] { "UserId", "MovieId" },
                unique: true,
                filter: "[MovieId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId_ShowId",
                table: "Reviews",
                columns: new[] { "UserId", "ShowId" },
                unique: true,
                filter: "[ShowId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Shows_ShowId",
                table: "Reviews",
                column: "ShowId",
                principalTable: "Shows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Shows_ShowId",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_ShowId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_UserId_MovieId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_UserId_ShowId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ShowId",
                table: "Reviews");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "Reviews",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                columns: new[] { "UserId", "MovieId" });
        }
    }
}
