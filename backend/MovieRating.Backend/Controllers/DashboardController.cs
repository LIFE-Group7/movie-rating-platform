using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.Dashboard;
using MovieRating.Backend.DTOs.Genre;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Security: Restricts access to this entire controller to users with the "Admin" role
[Authorize(Roles = "Admin")]
public class DashboardController : BaseApiController
{
    private readonly IGenreService _genreService;
    private readonly IHomeSectionService _homeSectionService;

    // Dependency Injection: The framework automatically provides these services when the controller is created
    public DashboardController(
        IGenreService genreService,
        IHomeSectionService homeSectionService)
    {
        _genreService = genreService;
        _homeSectionService = homeSectionService;
    }

    // GENRE ENDPOINTS

    // GET requests fetch data. This endpoint retrieves the list of all genres.
    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var result = await _genreService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // POST requests create new data. [FromBody] tells the app to grab the data from the incoming request payload.
    [HttpPost("genres")]
    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreDto genreDto)
    {
        var result = await _genreService.CreateAsync(genreDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // PUT requests update existing data. The '{id}' in the route maps directly to the 'int id' parameter.
    [HttpPut("genres/{id}")]
    public async Task<IActionResult> UpdateGenre(int id, [FromBody] UpdateGenreDto genreDto)
    {
        var result = await _genreService.UpdateAsync(id, genreDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // SECTION ENDPOINTS

    // We check for success, return the error if it failed, or return the data if it succeeded.
    [HttpGet("sections")]
    public async Task<IActionResult> GetAllSections()
    {
        var result = await _homeSectionService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }


    [HttpPost("sections")]
    public async Task<IActionResult> CreateSection([FromBody] CreateHomeSectionDto dto)
    {
        var result = await _homeSectionService.CreateAsync(dto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpPut("sections/{id}")]
    public async Task<IActionResult> UpdateSection(int id, [FromBody] UpdateHomeSectionDto dto)
    {
        var result = await _homeSectionService.UpdateAsync(id, dto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // DELETE requests remove data. On success, it returns a 204 No Content status (since there is nothing to send back).
    [HttpDelete("sections/{id}")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        var result = await _homeSectionService.DeleteAsync(id);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }
}