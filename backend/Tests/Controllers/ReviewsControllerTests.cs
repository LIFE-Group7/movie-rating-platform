using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.Services;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;

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
        SetupUserClaims("123"); // Mock logged-in user with ID 123
        var request = new ReviewRequestDto();
        var responseDto = new ReviewResponseDto { MovieId = 1, UserId = 123 };

        _mockService.Setup(s => s.CreateReviewAsync(123, request))
                    .ReturnsAsync(Result<ReviewResponseDto>.Success(responseDto));

        var result = await _controller.Create(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsType<ReviewResponseDto>(okResult.Value);
        Assert.Equal(123, returnedData.UserId);
    }
}