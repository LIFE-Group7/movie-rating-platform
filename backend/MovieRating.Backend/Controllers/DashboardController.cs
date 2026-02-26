using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.Dashboard;
using MovieRating.Backend.DTOs.Genre;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[Authorize (Roles = "Admin")]
public class DashboardController : BaseApiController
{
    private readonly IGenreService _genreService;
    private readonly IHomeSectionService _homeSectionService;
    
    public DashboardController(
        IGenreService genreService, 
        IHomeSectionService homeSectionService)
    {
        _genreService = genreService;
        _homeSectionService = homeSectionService;
    }
    
    // GENRE ENDPOINTS
    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var result = await _genreService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpPost("genres")]
    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreDto genreDto)
    {
        var result = await _genreService.CreateAsync(genreDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);   
    }

    [HttpPut("genres/{id}")]
    public async Task<IActionResult> UpdateGenre(int id, [FromBody] UpdateGenreDto genreDto)
    {
        var result = await _genreService.UpdateAsync(id, genreDto);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);  
    }

    [HttpDelete("genres/{id}")]
    public async Task<IActionResult> DeleteGenre(int id)
    {
        var result = await _genreService.DeleteAsync(id);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }
    
    // SECTION ENDPOINTS
    [HttpGet("sections")]
    public async Task<IActionResult> GetAllSections()
    {
        var result = await _homeSectionService.GetAllAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }
    
    [HttpGet("sections/active")]
    public async Task<IActionResult> GetActiveSections()
    {
        var result = await _homeSectionService.GetActiveSectionsAsync();
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
        if(!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpDelete("sections/{id}")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        var result = await _homeSectionService.DeleteAsync(id);
        if(!result.IsSuccess) return HandleError(result);
        return NoContent();
    }
}