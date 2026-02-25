using Microsoft.Extensions.Logging;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Services;

public class ReviewServiceTests
{
    private readonly Mock<IReviewRepository> _mockRepo;
    private readonly Mock<ILogger<ReviewService>> _mockLogger;
    private readonly ReviewService _reviewService;

    public ReviewServiceTests()
    {
        _mockRepo = new Mock<IReviewRepository>();
        _mockLogger = new Mock<ILogger<ReviewService>>();
        _reviewService = new ReviewService(_mockRepo.Object, _mockLogger.Object);
    }

    #region CreateReviewAsync Tests

    [Fact]
    public async Task CreateReviewAsync_WhenRepositorySucceeds_ReturnsSuccessResult()
    {
        var userId = 1;
        var request = new ReviewRequestDto { MovieId = 10, Rating = 9, Comment = "Amazing!" };
        var review = new Review { MovieId = 10, UserId = userId, Rating = 9, Comment = "Amazing!" };

        _mockRepo.Setup(r => r.AddMovieReviewAsync(It.IsAny<Review>()))
                 .ReturnsAsync(Result<Review>.Success(review));

        var result = await _reviewService.CreateReviewAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal(request.Rating, result.Data.Rating);
        Assert.Equal(request.Comment, result.Data.Comment);
    }

    [Fact]
    public async Task CreateReviewAsync_WhenRepositoryReturnsFailure_PassesFailureThrough()
    {
        var userId = 1;
        var request = new ReviewRequestDto { MovieId = 999, Rating = 5 }; // Non-existent movie

        _mockRepo.Setup(r => r.AddMovieReviewAsync(It.IsAny<Review>()))
                 .ReturnsAsync(Result<Review>.Failure("Movie not found.", ErrorType.NotFound));

        var result = await _reviewService.CreateReviewAsync(userId, request);

        Assert.False(result.IsSuccess);
        Assert.Null(result.Data);
        Assert.Equal("Movie not found.", result.Error);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    [Fact]
    public async Task CreateReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        var userId = 1;
        var request = new ReviewRequestDto { MovieId = 10, Rating = 9 };

        _mockRepo.Setup(r => r.AddMovieReviewAsync(It.IsAny<Review>()))
                 .ThrowsAsync(new Exception("Database connection failed"));

        var result = await _reviewService.CreateReviewAsync(userId, request);

        Assert.False(result.IsSuccess);
        Assert.Equal("An unexpected error occurred.", result.Error);
        Assert.Equal(ErrorType.Failure, result.Type);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.Once);
    }

    #endregion

    #region UpdateReviewAsync Tests

    [Fact]
    public async Task UpdateReviewAsync_WhenRepositorySucceeds_ReturnsSuccessResult()
    {
        var userId = 1;
        var request = new ReviewRequestDto { MovieId = 10, Rating = 5, Comment = "Changed my mind." };
        var updatedReview = new Review { MovieId = 10, UserId = userId, Rating = 5, Comment = "Changed my mind.", UpdatedAt = DateTime.UtcNow };

        _mockRepo.Setup(r => r.UpdateMovieReviewAsync(It.IsAny<Review>()))
                 .ReturnsAsync(Result<Review>.Success(updatedReview));

        var result = await _reviewService.UpdateReviewAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal(request.Rating, result.Data.Rating);
        Assert.Equal(request.Comment, result.Data.Comment);
        Assert.NotNull(result.Data.UpdatedAt);
    }

    [Fact]
    public async Task UpdateReviewAsync_WhenReviewNotFound_ReturnsFailureResult()
    {
        var userId = 1;
        var request = new ReviewRequestDto { MovieId = 10, Rating = 5 };

        _mockRepo.Setup(r => r.UpdateMovieReviewAsync(It.IsAny<Review>()))
                 .ReturnsAsync(Result<Review>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _reviewService.UpdateReviewAsync(userId, request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Review not found.", result.Error);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    [Fact]
    public async Task UpdateReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        var userId = 1;
        var request = new ReviewRequestDto { MovieId = 10, Rating = 5 };

        _mockRepo.Setup(r => r.UpdateMovieReviewAsync(It.IsAny<Review>()))
                 .ThrowsAsync(new Exception("Database timeout"));

        var result = await _reviewService.UpdateReviewAsync(userId, request);

        Assert.False(result.IsSuccess);
        Assert.Equal("An unexpected error occurred.", result.Error);
        Assert.Equal(ErrorType.Failure, result.Type);
    }

    #endregion

    #region GetUserReviewsAsync Tests

    [Fact]
    public async Task GetUserReviewsAsync_WhenRepositorySucceeds_ReturnsSuccessResultWithMappedData()
    {
        var userId = 1;
        var mockReviews = new List<Review>
        {
            new Review
            {
                MovieId = 10,
                UserId = userId,
                Rating = 9,
                Comment = "Amazing!",
                CreatedAt = DateTime.UtcNow,
                Movie = new Movie { Title = "Inception", CoverImageUrl = "url.jpg" } // Mock included movie
            }
        };

        _mockRepo.Setup(r => r.GetMovieReviewsByUserIdAsync(userId))
                 .ReturnsAsync(mockReviews);

        var result = await _reviewService.GetMovieUserReviewsAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data);

        var firstReview = result.Data.First();
        Assert.Equal(10, firstReview.MovieId);
        Assert.Equal("Inception", firstReview.MovieTitle);
        Assert.Equal("url.jpg", firstReview.MovieCoverImageUrl);
        Assert.Equal(9, firstReview.Rating);
    }

    [Fact]
    public async Task GetUserReviewsAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        var userId = 1;

        _mockRepo.Setup(r => r.GetMovieReviewsByUserIdAsync(userId))
                 .ThrowsAsync(new Exception("Database connection failed"));

        var result = await _reviewService.GetMovieUserReviewsAsync(userId);

        Assert.False(result.IsSuccess);
        Assert.Equal("An unexpected error occurred.", result.Error);
        Assert.Equal(ErrorType.Failure, result.Type);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.Once);
    }

    #endregion
}