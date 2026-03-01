using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Manages all movie-related requests. Because there is no class-level [Authorize] tag,
// these endpoints are public by default unless specified otherwise.
[ApiController]
[Route("api/[controller]")]
public class MovieController : BaseApiController
{
    private readonly IMovieService _movieService;

    public MovieController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    // Publicly accessible: Retrieves the entire catalog of movies.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _movieService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // Publicly accessible: Fetches details for a single movie using its ID.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _movieService.GetByIdAsync(id);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }


    // Security: Restricts creating new movies to Admins only.
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMovieDto movieDto)
    {
        var result = await _movieService.CreateAsync(movieDto);
        if (!result.IsSuccess) return HandleError(result);

        // Returns a 201 Created status and provides a link to fetch the newly created movie.
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }


    // Security: Restricts editing existing movies to Admins only.
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMovieDto movieDto)
    {
        var result = await _movieService.UpdateAsync(id, movieDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }


    // Security: Restricts deleting movies to Admins only.
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _movieService.DeleteAsync(id);
        if (!result.IsSuccess) return HandleError(result);

        // 204 No Content: The deletion was successful, and there's no data to send back.
        return NoContent();
    }

    // A specialized public endpoint to fetch a highlight reel of the best movies.
    // It's hardcoded to return 6 movies here, making it perfect for a homepage UI.
    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated()
    {
        var result = await _movieService.GetTopRatedMoviesAsync(6);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(result.Data);
    }
}