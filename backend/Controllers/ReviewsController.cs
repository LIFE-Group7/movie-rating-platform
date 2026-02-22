using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services;
using System.Security.Claims;
using MovieRating.Backend.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace MovieRating.Backend.Controllers;

[Authorize(Roles = "User")]

public class ReviewsController(IReviewService service) : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.CreateReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.UpdateReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserReviews()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.GetUserReviewsAsync(userId.Value);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return int.TryParse(claim, out int id) ? id : null;
    }
}