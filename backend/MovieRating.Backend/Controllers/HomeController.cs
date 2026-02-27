using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[AllowAnonymous]
public class HomeController : BaseApiController
{
    private readonly IHomeSectionService _homeSectionService;

    public HomeController(IHomeSectionService homeSectionService)
    {
        _homeSectionService = homeSectionService;
    }

    [HttpGet("sections")]
    public async Task<IActionResult> GetActiveSections()
    {
        var result = await _homeSectionService.GetActiveSectionsAsync();
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Data);
    }
}