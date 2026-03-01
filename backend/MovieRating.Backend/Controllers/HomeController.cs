using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

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

    [HttpGet("genres")]
    public async Task<IActionResult> GetActiveGenres()
    {
        var result = await _genreService.GetActiveAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }

    [HttpGet("sections")]
    public async Task<IActionResult> GetActiveSections()
    {
        var result = await _homeSectionService.GetActiveSectionsAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }
}