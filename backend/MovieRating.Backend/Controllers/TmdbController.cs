using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Common;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Handles importing external data from TMDB (The Movie Database) into your own database.
[ApiController]
[Route("api/[controller]")]
public class TmdbController : BaseApiController
{
    private readonly ITmdbImportService _tmdb;

    // C# Shortcut: The '=>' (expression body) is just a cleaner, one-line way to write 
    public TmdbController(ITmdbImportService tmdb) => _tmdb = tmdb;

    [HttpPost("import")]
    [Authorize(Roles = "User, Admin")]
    public async Task<IActionResult> Import(
        // Default values: If the client doesn't provide these in the URL 
        // (e.g., /api/Tmdb/import?moviePages=5), it safely defaults to 3 and 2.
        [FromQuery] int moviePages = 3,
        [FromQuery] int showPages = 2)
    {
        var result = await _tmdb.ImportAllAsync(moviePages, showPages);

        if (result.Data == null) return BadRequest();

        // Build a custom summary object to tell the client exactly what happened
        return Ok(new
        {
            message = "TMDB import complete.",
            moviesImported = result.IsSuccess ? result.Data.MoviesImported : 0,
            showsImported = result.IsSuccess ? result.Data.ShowsImported : 0,
            genresCreated = result.IsSuccess ? result.Data.GenresCreated : 0,
        });
    }
}