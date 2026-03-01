using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Security: Allows anyone to access these endpoints, even if they aren't logged in.
[AllowAnonymous]
public class HomeController : BaseApiController
{
    private readonly IGenreService _genreService;
    private readonly IHomeSectionService _homeSectionService;

    public HomeController(
        IHomeSectionService homeSectionService,
        IGenreService genreService)
    {
        _homeSectionService = homeSectionService;
        _genreService = genreService;
    }

    // Retrieves only the 'active' genres to display to the public, 
    // hiding any genres an admin might have temporarily disabled.
    [HttpGet("genres")]
    public async Task<IActionResult> GetActiveGenres()
    {
        var result = await _genreService.GetActiveAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    // Retrieves only the 'active' home sections (like "Trending Now" or "Top Rated") 
    // to build the public landing page.
    [HttpGet("sections")]
    public async Task<IActionResult> GetActiveSections()
    {
        var result = await _homeSectionService.GetActiveSectionsAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }
}