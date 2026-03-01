using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowController : BaseApiController
{
    private readonly IShowService _showService;

    public ShowController(IShowService showService)
    {
        _showService = showService;
    }

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

    
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShowDto showDto)
    {
        var result = await _showService.CreateAsync(showDto);
        if (!result.IsSuccess) return HandleError(result);
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

    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated()
    {
        var result = await _showService.GetTopRatedAsync(6);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }
}
