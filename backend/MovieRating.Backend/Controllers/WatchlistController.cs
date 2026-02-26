using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.User.Watchlist;
using MovieRating.Backend.Services.Interfaces;
using System.Security.Claims;

namespace MovieRating.Backend.Controllers;

[Authorize] 
public class WatchlistController(IWatchlistService watchlistService) : BaseApiController
{
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

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }
}