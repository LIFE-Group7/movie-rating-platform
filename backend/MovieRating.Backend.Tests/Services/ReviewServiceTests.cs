using Microsoft.Extensions.Logging;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
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

    #region CreateMovieReviewAsync Tests

    [Fact]
    public async Task CreateMovieReviewAsync_WhenSuccessful_ReturnsMappedReview()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 8, Comment = "Great movie!" };

        var createdReview = new ReviewMovie
        {
            UserId = 5,
            MovieId = 1,
            Rating = 8,
            Comment = "Great movie!",
            CreatedAt = DateTime.UtcNow
        };

        _mockRepo.Setup(r => r.AddMovieReviewAsync(It.IsAny<ReviewMovie>()))
                 .ReturnsAsync(Result<ReviewMovie>.Success(createdReview));

        var result = await _reviewService.CreateMovieReviewAsync(5, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.MovieId);
        Assert.Equal(8, result.Data.Rating);
        Assert.Equal("Great movie!", result.Data.Comment);
    }

    [Fact]
    public async Task CreateMovieReviewAsync_WhenRepositoryFails_ReturnsFailure()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 8 };

        _mockRepo.Setup(r => r.AddMovieReviewAsync(It.IsAny<ReviewMovie>()))
                 .ReturnsAsync(Result<ReviewMovie>.Failure("Review already exists.", ErrorType.Conflict));

        var result = await _reviewService.CreateMovieReviewAsync(5, request);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Conflict, result.Type);
    }

    [Fact]
    public async Task CreateMovieReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 8 };

        _mockRepo.Setup(r => r.AddMovieReviewAsync(It.IsAny<ReviewMovie>()))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.CreateMovieReviewAsync(5, request);

        Assert.False(result.IsSuccess);
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

    #region UpdateMovieReviewAsync Tests

    [Fact]
    public async Task UpdateMovieReviewAsync_WhenSuccessful_ReturnsMappedReview()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 9, Comment = "Even better on rewatch!" };

        var updatedReview = new ReviewMovie
        {
            UserId = 5,
            MovieId = 1,
            Rating = 9,
            Comment = "Even better on rewatch!",
            CreatedAt = DateTime.UtcNow.AddDays(-7),
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepo.Setup(r => r.UpdateMovieReviewAsync(It.IsAny<ReviewMovie>()))
                 .ReturnsAsync(Result<ReviewMovie>.Success(updatedReview));

        var result = await _reviewService.UpdateMovieReviewAsync(5, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(9, result.Data!.Rating);
        Assert.NotNull(result.Data.UpdatedAt);
    }

    [Fact]
    public async Task UpdateMovieReviewAsync_WhenReviewNotFound_ReturnsFailure()
    {
        var request = new MovieReviewRequestDto { MovieId = 99, Rating = 9 };

        _mockRepo.Setup(r => r.UpdateMovieReviewAsync(It.IsAny<ReviewMovie>()))
                 .ReturnsAsync(Result<ReviewMovie>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _reviewService.UpdateMovieReviewAsync(5, request);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    [Fact]
    public async Task UpdateMovieReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        var request = new MovieReviewRequestDto { MovieId = 1, Rating = 9 };

        _mockRepo.Setup(r => r.UpdateMovieReviewAsync(It.IsAny<ReviewMovie>()))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.UpdateMovieReviewAsync(5, request);

        Assert.False(result.IsSuccess);
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

    #region GetMovieUserReviewsAsync Tests

    [Fact]
    public async Task GetMovieUserReviewsAsync_WhenSuccessful_ReturnsMappedReviews()
    {
        var reviews = new List<ReviewMovie>
        {
            new()
            {
                UserId = 5,
                MovieId = 1,
                Rating = 8,
                Comment = "Good film",
                CreatedAt = DateTime.UtcNow,
                Movie = new Movie { Id = 1, Title = "Inception", CoverImageUrl = "inception.jpg" }
            }
        };

        _mockRepo.Setup(r => r.GetMovieReviewsByUserIdAsync(5)).ReturnsAsync(reviews);

        var result = await _reviewService.GetMovieUserReviewsAsync(5);

        Assert.True(result.IsSuccess);
        var items = result.Data!.ToList();
        Assert.Single(items);
        Assert.Equal("Inception", items[0].MovieTitle);
        Assert.Equal(8, items[0].Rating);
        Assert.Equal("inception.jpg", items[0].MovieCoverImageUrl);
    }

    [Fact]
    public async Task GetMovieUserReviewsAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        _mockRepo.Setup(r => r.GetMovieReviewsByUserIdAsync(5))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.GetMovieUserReviewsAsync(5);

        Assert.False(result.IsSuccess);
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

    #region DeleteMovieReviewAsync Tests

    [Fact]
    public async Task DeleteMovieReviewAsync_WhenSuccessful_ReturnsSuccess()
    {
        _mockRepo.Setup(r => r.DeleteMovieReviewAsync(5, 1))
                 .ReturnsAsync(Result<bool>.Success(true));

        var result = await _reviewService.DeleteMovieReviewAsync(5, 1);

        Assert.True(result.IsSuccess);
        Assert.True(result.Data);
    }

    [Fact]
    public async Task DeleteMovieReviewAsync_WhenNotFound_ReturnsFailure()
    {
        _mockRepo.Setup(r => r.DeleteMovieReviewAsync(5, 99))
                 .ReturnsAsync(Result<bool>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _reviewService.DeleteMovieReviewAsync(5, 99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    [Fact]
    public async Task DeleteMovieReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        _mockRepo.Setup(r => r.DeleteMovieReviewAsync(5, 1))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.DeleteMovieReviewAsync(5, 1);

        Assert.False(result.IsSuccess);
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

    #region CreateShowReviewAsync Tests

    [Fact]
    public async Task CreateShowReviewAsync_WhenSuccessful_ReturnsMappedReview()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 9, Comment = "Incredible show!" };

        var createdReview = new ReviewShow
        {
            UserId = 5,
            ShowId = 2,
            Rating = 9,
            Comment = "Incredible show!",
            CreatedAt = DateTime.UtcNow
        };

        _mockRepo.Setup(r => r.AddShowReviewAsync(It.IsAny<ReviewShow>()))
                 .ReturnsAsync(Result<ReviewShow>.Success(createdReview));

        var result = await _reviewService.CreateShowReviewAsync(5, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.ShowId);
        Assert.Equal(9, result.Data.Rating);
    }

    [Fact]
    public async Task CreateShowReviewAsync_WhenRepositoryFails_ReturnsFailure()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 9 };

        _mockRepo.Setup(r => r.AddShowReviewAsync(It.IsAny<ReviewShow>()))
                 .ReturnsAsync(Result<ReviewShow>.Failure("Review already exists.", ErrorType.Conflict));

        var result = await _reviewService.CreateShowReviewAsync(5, request);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Conflict, result.Type);
    }

    [Fact]
    public async Task CreateShowReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 9 };

        _mockRepo.Setup(r => r.AddShowReviewAsync(It.IsAny<ReviewShow>()))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.CreateShowReviewAsync(5, request);

        Assert.False(result.IsSuccess);
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

    #region UpdateShowReviewAsync Tests

    [Fact]
    public async Task UpdateShowReviewAsync_WhenSuccessful_ReturnsMappedReview()
    {
        var request = new ShowReviewRequestDto { ShowId = 2, Rating = 10, Comment = "Masterpiece!" };

        var updatedReview = new ReviewShow
        {
            UserId = 5,
            ShowId = 2,
            Rating = 10,
            Comment = "Masterpiece!",
            CreatedAt = DateTime.UtcNow.AddDays(-3),
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepo.Setup(r => r.UpdateShowReviewAsync(It.IsAny<ReviewShow>()))
                 .ReturnsAsync(Result<ReviewShow>.Success(updatedReview));

        var result = await _reviewService.UpdateShowReviewAsync(5, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(10, result.Data!.Rating);
        Assert.NotNull(result.Data.UpdatedAt);
    }

    [Fact]
    public async Task UpdateShowReviewAsync_WhenReviewNotFound_ReturnsFailure()
    {
        var request = new ShowReviewRequestDto { ShowId = 99, Rating = 10 };

        _mockRepo.Setup(r => r.UpdateShowReviewAsync(It.IsAny<ReviewShow>()))
                 .ReturnsAsync(Result<ReviewShow>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _reviewService.UpdateShowReviewAsync(5, request);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    #endregion

    #region GetShowUserReviewsAsync Tests

    [Fact]
    public async Task GetShowUserReviewsAsync_WhenSuccessful_ReturnsMappedReviews()
    {
        var reviews = new List<ReviewShow>
        {
            new()
            {
                UserId = 5,
                ShowId = 2,
                Rating = 9,
                Comment = "Brilliant writing",
                CreatedAt = DateTime.UtcNow,
                Show = new Show { Id = 2, Title = "Severance", CoverImageUrl = "severance.jpg" }
            }
        };

        _mockRepo.Setup(r => r.GetShowReviewsByUserIdAsync(5)).ReturnsAsync(reviews);

        var result = await _reviewService.GetShowUserReviewsAsync(5);

        Assert.True(result.IsSuccess);
        var items = result.Data!.ToList();
        Assert.Single(items);
        Assert.Equal("Severance", items[0].ShowTitle);
        Assert.Equal(9, items[0].Rating);
        Assert.Equal("severance.jpg", items[0].MovieCoverImageUrl);
    }

    [Fact]
    public async Task GetShowUserReviewsAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        _mockRepo.Setup(r => r.GetShowReviewsByUserIdAsync(5))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.GetShowUserReviewsAsync(5);

        Assert.False(result.IsSuccess);
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

    #region DeleteShowReviewAsync Tests

    [Fact]
    public async Task DeleteShowReviewAsync_WhenSuccessful_ReturnsSuccess()
    {
        _mockRepo.Setup(r => r.DeleteShowReviewAsync(5, 2))
                 .ReturnsAsync(Result<bool>.Success(true));

        var result = await _reviewService.DeleteShowReviewAsync(5, 2);

        Assert.True(result.IsSuccess);
        Assert.True(result.Data);
    }

    [Fact]
    public async Task DeleteShowReviewAsync_WhenNotFound_ReturnsFailure()
    {
        _mockRepo.Setup(r => r.DeleteShowReviewAsync(5, 99))
                 .ReturnsAsync(Result<bool>.Failure("Review not found.", ErrorType.NotFound));

        var result = await _reviewService.DeleteShowReviewAsync(5, 99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    [Fact]
    public async Task DeleteShowReviewAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        _mockRepo.Setup(r => r.DeleteShowReviewAsync(5, 2))
                 .ThrowsAsync(new Exception("Database error"));

        var result = await _reviewService.DeleteShowReviewAsync(5, 2);

        Assert.False(result.IsSuccess);
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
