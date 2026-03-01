using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services.Interfaces;
using System.Security.Claims;
using MovieRating.Backend.DTOs.User;

namespace MovieRating.Backend.Controllers;

[Authorize]
public class WatchlistController(IWatchlistService watchlistService) : BaseApiController
{
    // Fetches all the movies and shows the currently logged-in user has saved.
    [HttpGet]
    public async Task<IActionResult> GetWatchlist()
    {
        var userId = GetUserId();
        var result = await watchlistService.GetWatchlistAsync(userId);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return HandleError(result);
    }

    // Adds a new movie or show to the user's watchlist.
    [HttpPost]
    public async Task<IActionResult> AddToWatchlist([FromBody] AddToWatchlistDto request)
    {
        var userId = GetUserId();
        var result = await watchlistService.AddToWatchlistAsync(userId, request);

        if (result.IsSuccess)
        {
            return Ok(new { Message = "Added to watchlist successfully." });
        }

        return HandleError(result);
    }

    // Removes an item from the watchlist using its unique ID.
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromWatchlist(int id)
    {
        var userId = GetUserId();
        var result = await watchlistService.RemoveFromWatchlistAsync(userId, id);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return HandleError(result);
    }

    [HttpGet("status/{mediaType}/{mediaId}")]
    public async Task<IActionResult> CheckStatus(string mediaType, int mediaId)
    {
        var userId = GetUserId();
        var result = await watchlistService.CheckItemStatusAsync(userId, mediaId, mediaType);

        if (result.IsSuccess)
        {
            return Ok(new { IsInWatchlist = result.Data });
        }

        return HandleError(result);
    }

    // Helper method to extract the User ID from their security token.
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // The '!' is the null-forgiving operator. Because the whole controller has [Authorize], this won't be null. 
        return int.Parse(userIdClaim!);
    }
}