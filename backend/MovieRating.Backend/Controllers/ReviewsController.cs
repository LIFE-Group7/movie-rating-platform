using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

public class ReviewsController : BaseApiController
{
    private readonly IReviewService _service;
    
    public ReviewsController(IReviewService service)
    {
        this._service = service;
    }
    
    [Authorize (Roles = "User, Admin")]
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
    
    [HttpGet("movies/{movieId}")]
    public async Task<IActionResult> GetMovieReviews(int movieId)
    {
        var result = await _service.GetMovieReviewsAsync(movieId);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }
    
    [HttpGet("shows/{showId}")]
    public async Task<IActionResult> GetShowReviews(int showId)
    {
        var result = await _service.GetShowReviewsAsync(showId);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }
    
    [Authorize (Roles = "User, Admin")]
    [HttpPost("movies")]
    public async Task<IActionResult> CreateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateMovieReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }
    
    [Authorize (Roles = "User, Admin")]
    [HttpPost("shows")]
    public async Task<IActionResult> CreateShowReview([FromBody] ShowReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateShowReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }
    
    [Authorize (Roles = "User, Admin")]
    [HttpPut("shows")]
    public async Task<IActionResult> UpdateShowReview([FromBody] ShowReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.UpdateShowReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }
    
    [Authorize (Roles = "User, Admin")]
    [HttpPut("movies")]
    public async Task<IActionResult> UpdateMovieReview([FromBody] MovieReviewRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.UpdateMovieReviewAsync(userId.Value, request);
        return result.IsSuccess ? Ok(result.Data) : HandleError(result);
    }

    [Authorize (Roles = "User, Admin")]
    [HttpDelete("movies/{movieId}")]
    public async Task<IActionResult> DeleteMovieReview(int movieId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteMovieReviewAsync(userId.Value, movieId);
        return result.IsSuccess ? NoContent() : HandleError(result);
    }
    
    [Authorize (Roles = "User, Admin")]
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