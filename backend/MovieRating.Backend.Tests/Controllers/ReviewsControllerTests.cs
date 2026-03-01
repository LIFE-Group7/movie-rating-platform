using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.DTOs.Generic;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Services.Interfaces;
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

        SetAuthenticatedUser(userId: 5);
    }

    private void SetAuthenticatedUser(int userId)
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    private void SetUnauthenticatedUser()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
        };
    }

    #region CreateMovieReview Tests

    [Fact]
    public async Task CreateMovieReview_WhenSuccessful_ReturnsOkWithReview()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 8, Comment = "Great!" };
        var response = new MovieReviewResponseDto { MovieId = 1, UserId = 5, Rating = 8, Comment = "Great!" };

        _mockService.Setup(s => s.CreateMovieReviewAsync(5, request))
                    .ReturnsAsync(Result<MovieReviewResponseDto>.Success(response));

        var result = await _controller.CreateMovieReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReview = Assert.IsType<MovieReviewResponseDto>(okResult.Value);
        Assert.Equal(8, returnedReview.Rating);
        Assert.Equal("Great!", returnedReview.Comment);
    }

    [Fact]
    public async Task CreateMovieReview_WhenServiceFails_ReturnsHandledError()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 8 };

        _mockService.Setup(s => s.CreateMovieReviewAsync(5, request))
                    .ReturnsAsync(Result<MovieReviewResponseDto>.Failure("Review already exists.", ErrorType.Conflict));

        var result = await _controller.CreateMovieReview(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    [Fact]
    public async Task CreateMovieReview_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 8 };

        var result = await _controller.CreateMovieReview(request);

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.CreateMovieReviewAsync(It.IsAny<int>(), It.IsAny<MovieReviewRequestDto>()), Times.Never);
    }

    #endregion

    #region UpdateMovieReview Tests

    [Fact]
    public async Task UpdateMovieReview_WhenSuccessful_ReturnsOkWithUpdatedReview()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 9, Comment = "Better on rewatch." };
        var response = new MovieReviewResponseDto { MovieId = 1, UserId = 5, Rating = 9, Comment = "Better on rewatch." };

        _mockService.Setup(s => s.UpdateMovieReviewAsync(5, request))
                    .ReturnsAsync(Result<MovieReviewResponseDto>.Success(response));

        var result = await _controller.UpdateMovieReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReview = Assert.IsType<MovieReviewResponseDto>(okResult.Value);
        Assert.Equal(9, returnedReview.Rating);
    }

    [Fact]
    public async Task UpdateMovieReview_WhenNotFound_ReturnsHandledError()
    {
        var request = new MovieReviewRequestDto { MovieId = 99, Rating = 9 };

        _mockService.Setup(s => s.UpdateMovieReviewAsync(5, request))
                    .ReturnsAsync(Result<MovieReviewResponseDto>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _controller.UpdateMovieReview(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    [Fact]
    public async Task UpdateMovieReview_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 9 };

        var result = await _controller.UpdateMovieReview(request);

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.UpdateMovieReviewAsync(It.IsAny<int>(), It.IsAny<MovieReviewRequestDto>()), Times.Never);
    }

    #endregion

    #region CreateShowReview Tests

    [Fact]
    public async Task CreateShowReview_WhenSuccessful_ReturnsOkWithReview()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 10, Comment = "Perfect!" };
        var response = new ShowReviewResponseDto { ShowId = 2, UserId = 5, Rating = 10 };

        _mockService.Setup(s => s.CreateShowReviewAsync(5, request))
                    .ReturnsAsync(Result<ShowReviewResponseDto>.Success(response));

        var result = await _controller.CreateShowReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReview = Assert.IsType<ShowReviewResponseDto>(okResult.Value);
        Assert.Equal(10, returnedReview.Rating);
    }

    [Fact]
    public async Task CreateShowReview_WhenConflict_ReturnsHandledError()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 10 };

        _mockService.Setup(s => s.CreateShowReviewAsync(5, request))
                    .ReturnsAsync(Result<ShowReviewResponseDto>.Failure("Review already exists.", ErrorType.Conflict));

        var result = await _controller.CreateShowReview(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    [Fact]
    public async Task CreateShowReview_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 10 };

        var result = await _controller.CreateShowReview(request);

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.CreateShowReviewAsync(It.IsAny<int>(), It.IsAny<ShowReviewRequestDto>()), Times.Never);
    }

    #endregion

    #region UpdateShowReview Tests

    [Fact]
    public async Task UpdateShowReview_WhenSuccessful_ReturnsOkWithUpdatedReview()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 9, Comment = "Incredible." };
        var response = new ShowReviewResponseDto { ShowId = 2, UserId = 5, Rating = 9 };

        _mockService.Setup(s => s.UpdateShowReviewAsync(5, request))
                    .ReturnsAsync(Result<ShowReviewResponseDto>.Success(response));

        var result = await _controller.UpdateShowReview(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReview = Assert.IsType<ShowReviewResponseDto>(okResult.Value);
        Assert.Equal(9, returnedReview.Rating);
    }

    [Fact]
    public async Task UpdateShowReview_WhenNotFound_ReturnsHandledError()
    {
        var request = new ShowReviewRequestDto { ShowId = 99, Rating = 9 };

        _mockService.Setup(s => s.UpdateShowReviewAsync(5, request))
                    .ReturnsAsync(Result<ShowReviewResponseDto>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _controller.UpdateShowReview(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }
    
    [Fact]
    public async Task UpdateShowReview_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 9 };

        var result = await _controller.UpdateShowReview(request);

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.UpdateShowReviewAsync(It.IsAny<int>(), It.IsAny<ShowReviewRequestDto>()), Times.Never);
    }

    #endregion

    #region GetUserReviews Tests

    [Fact]
    public async Task GetUserReviews_WhenSuccessful_ReturnsOkWithBothReviewTypes()
    {
        var movieReviews = new List<UserMovieResponseReviewDto>
        {
            new() { MovieId = 1, MovieTitle = "Inception", Rating = 9 }
        };
        var showReviews = new List<UserShowResponseReviewDto>
        {
            new() { ShowId = 2, ShowTitle = "Severance", Rating = 10 }
        };

        _mockService.Setup(s => s.GetMovieUserReviewsAsync(5))
                    .ReturnsAsync(Result<IEnumerable<UserMovieResponseReviewDto>>.Success(movieReviews));
        _mockService.Setup(s => s.GetShowUserReviewsAsync(5))
                    .ReturnsAsync(Result<IEnumerable<UserShowResponseReviewDto>>.Success(showReviews));

        var result = await _controller.GetUserReviews();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var movieReviewsProp = okResult.Value!.GetType().GetProperty("MovieReviews");
        var showReviewsProp = okResult.Value!.GetType().GetProperty("ShowReviews");
        Assert.NotNull(movieReviewsProp?.GetValue(okResult.Value));
        Assert.NotNull(showReviewsProp?.GetValue(okResult.Value));
    }

    [Fact]
    public async Task GetUserReviews_WhenMovieReviewsFail_ReturnsHandledError()
    {
        _mockService.Setup(s => s.GetMovieUserReviewsAsync(5))
                    .ReturnsAsync(Result<IEnumerable<UserMovieResponseReviewDto>>.Failure("Error", ErrorType.Failure));

        var result = await _controller.GetUserReviews();

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    [Fact]
    public async Task GetUserReviews_WhenShowReviewsFail_ReturnsHandledError()
    {
        var movieReviews = new List<UserMovieResponseReviewDto>();

        _mockService.Setup(s => s.GetMovieUserReviewsAsync(5))
                    .ReturnsAsync(Result<IEnumerable<UserMovieResponseReviewDto>>.Success(movieReviews));
        _mockService.Setup(s => s.GetShowUserReviewsAsync(5))
                    .ReturnsAsync(Result<IEnumerable<UserShowResponseReviewDto>>.Failure("Error", ErrorType.Failure));

        var result = await _controller.GetUserReviews();

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    [Fact]
    public async Task GetUserReviews_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();

        var result = await _controller.GetUserReviews();

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.GetMovieUserReviewsAsync(It.IsAny<int>()), Times.Never);
    }

    #endregion

    #region GetMovieReviews Tests

    [Fact]
    public async Task GetMovieReviews_WhenSuccessful_ReturnsOkWithReviews()
    {
        var reviews = new List<MovieReviewDto>
        {
            new()
            {
                MovieId = 1,
                Author = new ReviewAuthorDto { UserId = 5, Username = "testuser" },
                Rating = 8,
                Comment = "Great movie!",
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                MovieId = 1,
                Author = new ReviewAuthorDto { UserId = 6, Username = "anotheruser" },
                Rating = 7,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mockService.Setup(s => s.GetMovieReviewsAsync(1))
                    .ReturnsAsync(Result<IEnumerable<MovieReviewDto>>.Success(reviews));

        var result = await _controller.GetMovieReviews(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReviews = Assert.IsAssignableFrom<IEnumerable<MovieReviewDto>>(okResult.Value);
        Assert.Equal(2, returnedReviews.Count());
    }

    [Fact]
    public async Task GetMovieReviews_WhenEmpty_ReturnsOkWithEmptyList()
    {
        _mockService.Setup(s => s.GetMovieReviewsAsync(1))
                    .ReturnsAsync(Result<IEnumerable<MovieReviewDto>>.Success(new List<MovieReviewDto>()));

        var result = await _controller.GetMovieReviews(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReviews = Assert.IsAssignableFrom<IEnumerable<MovieReviewDto>>(okResult.Value);
        Assert.Empty(returnedReviews);
    }

    [Fact]
    public async Task GetMovieReviews_WhenServiceFails_ReturnsHandledError()
    {
        _mockService.Setup(s => s.GetMovieReviewsAsync(1))
                    .ReturnsAsync(Result<IEnumerable<MovieReviewDto>>.Failure("An unexpected error occurred.", ErrorType.Failure));

        var result = await _controller.GetMovieReviews(1);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    #endregion

    #region GetShowReviews Tests

    [Fact]
    public async Task GetShowReviews_WhenSuccessful_ReturnsOkWithReviews()
    {
        var reviews = new List<ShowReviewDto>
        {
            new()
            {
                ShowId = 2,
                Author = new ReviewAuthorDto { UserId = 5, Username = "testuser" },
                Rating = 10,
                Comment = "Incredible!",
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                ShowId = 2,
                Author = new ReviewAuthorDto { UserId = 6, Username = "anotheruser" },
                Rating = 9,
                CreatedAt = DateTime.UtcNow
            }
        };

        _mockService.Setup(s => s.GetShowReviewsAsync(2))
                    .ReturnsAsync(Result<IEnumerable<ShowReviewDto>>.Success(reviews));

        var result = await _controller.GetShowReviews(2);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReviews = Assert.IsAssignableFrom<IEnumerable<ShowReviewDto>>(okResult.Value);
        Assert.Equal(2, returnedReviews.Count());
    }

    [Fact]
    public async Task GetShowReviews_WhenEmpty_ReturnsOkWithEmptyList()
    {
        _mockService.Setup(s => s.GetShowReviewsAsync(2))
                    .ReturnsAsync(Result<IEnumerable<ShowReviewDto>>.Success(new List<ShowReviewDto>()));

        var result = await _controller.GetShowReviews(2);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedReviews = Assert.IsAssignableFrom<IEnumerable<ShowReviewDto>>(okResult.Value);
        Assert.Empty(returnedReviews);
    }

    [Fact]
    public async Task GetShowReviews_WhenServiceFails_ReturnsHandledError()
    {
        _mockService.Setup(s => s.GetShowReviewsAsync(2))
                    .ReturnsAsync(Result<IEnumerable<ShowReviewDto>>.Failure("An unexpected error occurred.", ErrorType.Failure));

        var result = await _controller.GetShowReviews(2);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    #endregion

    #region DeleteMovieReview Tests

    [Fact]
    public async Task DeleteMovieReview_WhenSuccessful_ReturnsNoContent()
    {
        _mockService.Setup(s => s.DeleteMovieReviewAsync(5, 1))
                    .ReturnsAsync(Result<bool>.Success(true));

        var result = await _controller.DeleteMovieReview(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteMovieReview_WhenNotFound_ReturnsHandledError()
    {
        _mockService.Setup(s => s.DeleteMovieReviewAsync(5, 99))
                    .ReturnsAsync(Result<bool>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _controller.DeleteMovieReview(99);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    [Fact]
    public async Task DeleteMovieReview_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();

        var result = await _controller.DeleteMovieReview(1);

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.DeleteMovieReviewAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    #endregion

    #region DeleteShowReview Tests

    [Fact]
    public async Task DeleteShowReview_WhenSuccessful_ReturnsNoContent()
    {
        _mockService.Setup(s => s.DeleteShowReviewAsync(5, 2))
                    .ReturnsAsync(Result<bool>.Success(true));

        var result = await _controller.DeleteShowReview(2);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteShowReview_WhenNotFound_ReturnsHandledError()
    {
        _mockService.Setup(s => s.DeleteShowReviewAsync(5, 99))
                    .ReturnsAsync(Result<bool>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _controller.DeleteShowReview(99);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    [Fact]
    public async Task DeleteShowReview_WhenUserNotAuthenticated_ReturnsUnauthorized()
    {
        SetUnauthenticatedUser();

        var result = await _controller.DeleteShowReview(2);

        Assert.IsType<UnauthorizedResult>(result);
        _mockService.Verify(s => s.DeleteShowReviewAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    #endregion
}
