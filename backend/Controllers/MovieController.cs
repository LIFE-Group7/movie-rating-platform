using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovieController : BaseApiController    
{
    private readonly IMovieService _movieService;
    
    public MovieController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await  _movieService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _movieService.GetByIdAsync(id);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMovieDto movieDto)
    {
        var result = await _movieService.CreateAsync(movieDto);
        if (!result.IsSuccess) return HandleError(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMovieDto movieDto)
    {
        var result = await _movieService.UpdateAsync(id, movieDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _movieService.DeleteAsync(id);
        if(!result.IsSuccess)  return HandleError(result);
        return NoContent();
    }
}