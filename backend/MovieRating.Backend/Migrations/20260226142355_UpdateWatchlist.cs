using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieRating.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWatchlist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Watchlist",
                table: "Watchlist");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "Watchlist",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Watchlist",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "Watchlist",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ShowId",
                table: "Watchlist",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Watchlist",
                table: "Watchlist",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Watchlist_ShowId",
                table: "Watchlist",
                column: "ShowId");

            migrationBuilder.CreateIndex(
                name: "IX_Watchlist_UserId_MovieId",
                table: "Watchlist",
                columns: new[] { "UserId", "MovieId" },
                unique: true,
                filter: "[MovieId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Watchlist_UserId_ShowId",
                table: "Watchlist",
                columns: new[] { "UserId", "ShowId" },
                unique: true,
                filter: "[ShowId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Watchlist_Shows_ShowId",
                table: "Watchlist",
                column: "ShowId",
                principalTable: "Shows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Watchlist_Shows_ShowId",
                table: "Watchlist");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Watchlist",
                table: "Watchlist");

            migrationBuilder.DropIndex(
                name: "IX_Watchlist_ShowId",
                table: "Watchlist");

            migrationBuilder.DropIndex(
                name: "IX_Watchlist_UserId_MovieId",
                table: "Watchlist");

            migrationBuilder.DropIndex(
                name: "IX_Watchlist_UserId_ShowId",
                table: "Watchlist");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Watchlist");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Watchlist");

            migrationBuilder.DropColumn(
                name: "ShowId",
                table: "Watchlist");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "Watchlist",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Watchlist",
                table: "Watchlist",
                columns: new[] { "UserId", "MovieId" });
        }
    }
}
