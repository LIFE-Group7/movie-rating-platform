using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Common;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TmdbController : BaseApiController
{
    private readonly ITmdbImportService _tmdb;

    public TmdbController(ITmdbImportService tmdb) => _tmdb = tmdb;

    [HttpPost("import")]
    [Authorize(Roles = "User, Admin")]    
    public async Task<IActionResult> Import(
        [FromQuery] int moviePages = 3,
        [FromQuery] int showPages  = 2)
    {
        var result = await _tmdb.ImportAllAsync(moviePages, showPages);
        if (result.Data == null) return BadRequest();
        return Ok(new
        {
            message        = "TMDB import complete.",
            moviesImported = result.IsSuccess ? result.Data.MoviesImported : 0,
            showsImported  = result.IsSuccess ? result.Data.ShowsImported : 0,
            genresCreated  = result.IsSuccess ? result.Data.GenresCreated : 0,
        });
    }
}