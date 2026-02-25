using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Services.Interfaces;
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

    #region Create Tests

    [Fact]
    public async Task Create_WhenUserIdIsMissing_ReturnsUnauthorized()
    {
        SetupUserClaims(null);

        var result = await _controller.Create(new ReviewRequestDto());

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Create_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var request = new ReviewRequestDto();
        var responseDto = new ReviewResponseDto { MovieId = 1, UserId = 123 };

        _mockService.Setup(s => s.CreateReviewAsync(123, request))
                    .ReturnsAsync(Result<ReviewResponseDto>.Success(responseDto));

        var result = await _controller.Create(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<ReviewResponseDto>(okResult.Value);
        Assert.Equal(123, returnedData.UserId);
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_WhenUserIdIsMissing_ReturnsUnauthorized()
    {
        SetupUserClaims(null);

        var result = await _controller.Update(new ReviewRequestDto());

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Update_WhenSuccessful_ReturnsOkWithData()
    {
        SetupUserClaims("123");
        var request = new ReviewRequestDto();
        var responseDto = new ReviewResponseDto { MovieId = 1, UserId = 123 };

        _mockService.Setup(s => s.UpdateReviewAsync(123, request))
                    .ReturnsAsync(Result<ReviewResponseDto>.Success(responseDto));

        var result = await _controller.Update(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<ReviewResponseDto>(okResult.Value);
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