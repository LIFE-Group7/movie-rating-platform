using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[Authorize(Roles = "User, Admin")]

public class ReviewsController : BaseApiController
{
    private readonly IReviewService _service;
    
    public ReviewsController(IReviewService service)
    {
        this._service = service;
    }
    
    /// <summary>
    /// Creates a review for a movie.
    /// </summary>
    [HttpPost("movies")]
    public async Task<IActionResult> CreateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateMovieReviewAsync(userId.Value, request);
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

        var result = await _service.UpdateMovieReviewAsync(userId.Value, request);
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

        var result = await _service.CreateShowReviewAsync(userId.Value, request);
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

        var result = await _service.UpdateShowReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    /// <summary>
    /// Updates a review for a show.
    /// </summary>
    [HttpGet("user")]
    public async Task<IActionResult> GetUserReviews()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var movieReviewsResult = await _service.GetMovieUserReviewsAsync(userId.Value);
        var showReviewsResult = await _service.GetShowUserReviewsAsync(userId.Value);

        if (!movieReviewsResult.IsSuccess) return HandleError(movieReviewsResult);
        if (!showReviewsResult.IsSuccess) return HandleError(showReviewsResult);

        return Ok(new
        {
            MovieReviews = movieReviewsResult.Data,
            ShowReviews = showReviewsResult.Data
        });
    }
    
    /// <summary>
    /// Deletes a review for a movie.
    /// </summary>
    [HttpDelete("movies/{movieId}")]
    public async Task<IActionResult> DeleteMovieReview(int movieId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteMovieReviewAsync(userId.Value, movieId);
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

        var result = await _service.DeleteShowReviewAsync(userId.Value, showId);
        return result.IsSuccess ? NoContent() : HandleError(result);
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return int.TryParse(claim, out int id) ? id : null;
    }
}