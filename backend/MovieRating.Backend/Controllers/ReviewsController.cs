using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

// Handles reading, writing, and deleting reviews for both movies and shows.
public class ReviewsController : BaseApiController
{
    private readonly IReviewService _service;

    public ReviewsController(IReviewService service)
    {
        this._service = service;
    }

    // Security: Requires the user to be logged in.
    // This endpoint fetches a unified list of all reviews written by the currently logged-in user.
    [Authorize(Roles = "User, Admin")]
    [HttpGet("user")]
    public async Task<IActionResult> GetUserReviews()
    {
        var userId = GetUserId();
        // If we can't find a valid user ID in their security token, reject the request with a 401.
        if (userId == null) return Unauthorized();

        var movieReviewsResult = await _service.GetMovieUserReviewsAsync(userId.Value);
        var showReviewsResult = await _service.GetShowUserReviewsAsync(userId.Value);

        if (!movieReviewsResult.IsSuccess) return HandleError(movieReviewsResult);
        if (!showReviewsResult.IsSuccess) return HandleError(showReviewsResult);

        // Combines both results into a single, clean response object for the client
        return Ok(new
        {
            MovieReviews = movieReviewsResult.Data,
            ShowReviews = showReviewsResult.Data
        });
    }

    // Public endpoints: Notice these lack the [Authorize] tag. 
    // Anyone browsing the site can read reviews for a specific movie or show.
    [HttpGet("movies/{movieId}")]
    public async Task<IActionResult> GetMovieReviews(int movieId)
    {
        var result = await _service.GetMovieReviewsAsync(movieId);
        // Uses a ternary operator (? :) as a clean, single-line shorthand for an if/else statement.
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [HttpGet("shows/{showId}")]
    public async Task<IActionResult> GetShowReviews(int showId)
    {
        var result = await _service.GetShowReviewsAsync(showId);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    // --- Write Operations (Create, Update, Delete) ---
    // All of the following endpoints require the user to be logged in. 
    // They verify the User ID first to ensure users can only alter their own reviews.

    [Authorize(Roles = "User, Admin")]
    [HttpPost("movies")]
    public async Task<IActionResult> CreateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateMovieReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [Authorize(Roles = "User, Admin")]
    [HttpPost("shows")]
    public async Task<IActionResult> CreateShowReview([FromBody] ShowReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateShowReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [Authorize(Roles = "User, Admin")]
    [HttpPut("shows")]
    public async Task<IActionResult> UpdateShowReview([FromBody] ShowReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.UpdateShowReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [Authorize(Roles = "User, Admin")]
    [HttpPut("movies")]
    public async Task<IActionResult> UpdateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.UpdateMovieReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [Authorize(Roles = "User, Admin")]
    [HttpDelete("movies/{movieId}")]
    public async Task<IActionResult> DeleteMovieReview(int movieId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteMovieReviewAsync(userId.Value, movieId);
        return result.IsSuccess ? NoContent() : HandleError(result);
    }

    [Authorize(Roles = "User, Admin")]
    [HttpDelete("shows/{showId}")]
    public async Task<IActionResult> DeleteShowReview(int showId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteShowReviewAsync(userId.Value, showId);
        return result.IsSuccess ? NoContent() : HandleError(result);
    }

    // Helper method: Extracts the securely verified User ID from the authentication token.
    private int? GetUserId()
    {
        // Looks for the standard 'NameIdentifier' claim or the 'sub' (subject) claim packed inside the JWT token.
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return int.TryParse(claim, out int id) ? id : null;
    }
}