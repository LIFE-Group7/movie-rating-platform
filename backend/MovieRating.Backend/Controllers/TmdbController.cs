using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TmdbController : BaseApiController
{
    private readonly ITmdbImportService _tmdb;

    public TmdbController(ITmdbImportService tmdb) => _tmdb = tmdb;

    /// <summary>
    /// Triggers a TMDB import. Skips titles that already exist in the database.
    /// Query params: moviePages (default 3 = 60 movies), showPages (default 2 = 40 shows).
    /// </summary>
    [HttpPost("import")]
    [Authorize(Roles = "User, Admin")]    
    public async Task<IActionResult> Import(
        [FromQuery] int moviePages = 3,
        [FromQuery] int showPages  = 2)
    {
        var result = await _tmdb.ImportAllAsync(moviePages, showPages);
        return Ok(new
        {
            message        = "TMDB import complete.",
            moviesImported = result.MoviesImported,
            showsImported  = result.ShowsImported,
            genresCreated  = result.GenresCreated,
        });
    }
}