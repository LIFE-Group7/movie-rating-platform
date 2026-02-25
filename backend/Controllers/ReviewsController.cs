using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Services;
using MovieRating.Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MovieRating.Backend.Controllers;

[Authorize(Roles = "User, Admin")]

public class ReviewsController(IReviewService service) : BaseApiController
{
    /// <summary>
    /// Creates a review for a movie.
    /// </summary>
    [HttpPost("movies")]
    public async Task<IActionResult> CreateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.CreateMovieReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    /// <summary>
    /// Updates a review for a movie.
    /// </summary>
    [HttpPut("movies")]
    public async Task<IActionResult> UpdateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.UpdateMovieReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    /// <summary>
    /// Creates a review for a show.
    /// </summary>
    [HttpPost("shows")]
    public async Task<IActionResult> CreateShowReview([FromBody] ShowReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.CreateShowReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    /// <summary>
    /// Updates a review for a show.
    /// </summary>
    [HttpPut("shows")]
    public async Task<IActionResult> UpdateShowReview([FromBody] ShowReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.UpdateShowReviewAsync(userId.Value, request);
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
    /// <summary>
    /// Deletes a review for a movie.
    /// </summary>
    [HttpDelete("movies/{movieId}")]
    public async Task<IActionResult> DeleteMovieReview(int movieId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.DeleteMovieReviewAsync(userId.Value, movieId);
        return result.IsSuccess ? NoContent() : HandleError(result);
    }

    /// <summary>
    /// Deletes a review for a show.
    /// </summary>
    [HttpDelete("shows/{showId}")]
    public async Task<IActionResult> DeleteShowReview(int showId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await service.DeleteShowReviewAsync(userId.Value, showId);
        return result.IsSuccess ? NoContent() : HandleError(result);
    }


    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return int.TryParse(claim, out int id) ? id : null;
    }
}