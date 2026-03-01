using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Handles all requests related to TV Shows. 
// Just like the MovieController, reading data is public, but making changes requires Admin access.
[ApiController]
[Route("api/[controller]")]
public class ShowController : BaseApiController
{
    private readonly IShowService _showService;

    public ShowController(IShowService showService)
    {
        _showService = showService;
    }

    // --- Public Endpoints (Anyone can view) ---

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _showService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _showService.GetByIdAsync(id);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // --- Admin Endpoints (Requires login and Admin role) ---

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShowDto showDto)
    {
        var result = await _showService.CreateAsync(showDto);
        if (!result.IsSuccess) return HandleError(result);

        // Returns a 201 Created and points to the new show's URL
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateShowDto showDto)
    {
        var result = await _showService.UpdateAsync(id, showDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _showService.DeleteAsync(id);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // --- Special Features ---

    // Public endpoint customized to pull exactly 6 top-rated shows, likely for a homepage carousel.
    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated()
    {
        var result = await _showService.GetTopRatedAsync(6);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }
}