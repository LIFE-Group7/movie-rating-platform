using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Handles the global search functionality across the entire platform.
[ApiController]
[Route("api/[controller]")]
public class SearchController : BaseApiController
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    // [FromQuery] tells the application to grab the 'query' text directly from the URL.
    // Example: an incoming request might look like /api/Search?query=batman
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        // Defensive programming: If the search box was empty or just spaces, return an empty list right away.
        // This is a great optimization because it prevents a useless and potentially slow call to the database.
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<object>());
        }

        // Pass the valid search term to the service layer to look up movies, shows, or actors
        var result = await _searchService.SearchGlobalAsync(query);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(result.Data);
    }
}