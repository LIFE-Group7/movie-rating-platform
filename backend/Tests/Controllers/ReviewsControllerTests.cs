using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.DTOs.Reviews;
using MovieRating.Backend.Services;
using System.Security.Claims;
using Xunit;

namespace MovieRating.Backend.Tests.Controllers;

public class ReviewsControllerTests
{
    private readonly Mock<IReviewService> _mockService;
    private readonly ReviewsController _controller;

    public ReviewsControllerTests()
    {
        _mockService = new Mock<IReviewService>();
        _controller = new ReviewsController(_mockService.Object);
    }

    private void SetupUserClaims(string? userId)
    {
        var claims = new List<Claim>();
        if (userId != null)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
        }

        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    #region Create Movie Tests

    [Fact]
    public async Task CreateMovieReview_WhenUserIdIsMissing_ReturnsUnauthorized()
    {
        SetupUserClaims(null);

        var result = await _controller.CreateMovieReview(new MovieReviewRequestDto());

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task CreateMovieReview_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 9 };
        var responseDto = new MovieReviewResponseDto { MovieId = 1, UserId = 123 };

        _mockService.Setup(s => s.CreateMovieReviewAsync(123, request))
                    .ReturnsAsync(Result<MovieReviewResponseDto>.Success(responseDto));

        var result = await _controller.CreateMovieReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<MovieReviewResponseDto>(okResult.Value);
        Assert.Equal(123, returnedData.UserId);
    }

    [Fact]
    public async Task CreateShowReview_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 8 };
        var responseDto = new ShowReviewResponseDto { ShowId = 2, UserId = 123 };

        _mockService.Setup(s => s.CreateShowReviewAsync(123, request))
                    .ReturnsAsync(Result<ShowReviewResponseDto>.Success(responseDto));

        var result = await _controller.CreateShowReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<ShowReviewResponseDto>(okResult.Value);
        Assert.Equal(123, returnedData.UserId);
    }

    #endregion

    #region Update Movie Tests

    [Fact]
    public async Task UpdateMovieReview_WhenUserIdIsMissing_ReturnsUnauthorized()
    {
        SetupUserClaims(null);

        var result = await _controller.UpdateMovieReview(new MovieReviewRequestDto());

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task UpdateMovieReview_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 9 };
        var responseDto = new MovieReviewResponseDto { MovieId = 1, UserId = 123 };

        _mockService.Setup(s => s.UpdateMovieReviewAsync(123, request))
                    .ReturnsAsync(Result<MovieReviewResponseDto>.Success(responseDto));

        var result = await _controller.UpdateMovieReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<MovieReviewResponseDto>(okResult.Value);
        Assert.Equal(123, returnedData.UserId);
    }

    [Fact]
    public async Task UpdateShowReview_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var request = new ShowReviewRequestDto { ShowId = 3, Rating = 9 };
        var responseDto = new ShowReviewResponseDto { ShowId = 3, UserId = 123 };

        _mockService.Setup(s => s.UpdateShowReviewAsync(123, request))
                    .ReturnsAsync(Result<ShowReviewResponseDto>.Success(responseDto));

        var result = await _controller.UpdateShowReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<ShowReviewResponseDto>(okResult.Value);
        Assert.Equal(123, returnedData.UserId);
    }

    #endregion

    #region GetUserReviews Tests

    [Fact]
    public async Task GetUserReviews_WhenUserIdIsMissing_ReturnsUnauthorized()
    {
        SetupUserClaims(null);

        var result = await _controller.GetUserReviews();

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetUserReviews_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var mockReviews = new List<UserReviewResponseDto>
        {
            new() { MovieId = 1, MovieTitle = "Inception", Rating = 10 }
        };

        _mockService.Setup(s => s.GetUserReviewsAsync(123))
                    .ReturnsAsync(Result<IEnumerable<UserReviewResponseDto>>.Success(mockReviews));

        var result = await _controller.GetUserReviews();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsAssignableFrom<IEnumerable<UserReviewResponseDto>>(okResult.Value);
        Assert.Single(returnedData);
    }

    #endregion
}