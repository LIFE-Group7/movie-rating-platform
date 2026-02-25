using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Models.Basics;
using MovieRating.Backend.Repositories;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Services;

public class ReviewServiceTests
{
    private readonly Mock<IReviewRepository> _mockRepository;
    private readonly Mock<ILogger<ReviewService>> _mockLogger;
    private readonly ReviewService _reviewService;

    public ReviewServiceTests()
    {
        _mockRepository = new Mock<IReviewRepository>();
        _mockLogger = new Mock<ILogger<ReviewService>>();
        _reviewService = new ReviewService(_mockRepository.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task CreateMovieReviewAsync_WhenRepositorySucceeds_ReturnsSuccessResult()
    {
        var userId = 1;
        var request = new MovieReviewRequestDto { MovieId = 10, Rating = 9, Comment = "Great" };
        var review = new Review { MovieId = 10, UserId = userId, Rating = 9, Comment = "Great" };

        _mockRepository.Setup(repository => repository.AddMovieReviewAsync(It.IsAny<Review>()))
            .ReturnsAsync(Result<Review>.Success(review));

        var result = await _reviewService.CreateMovieReviewAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(10, result.Data!.MovieId);
    }

    [Fact]
    public async Task CreateShowReviewAsync_WhenRepositorySucceeds_ReturnsSuccessResult()
    {
        var userId = 1;
        var request = new ShowReviewRequestDto { ShowId = 20, Rating = 8, Comment = "Great show" };
        var review = new Review { ShowId = 20, UserId = userId, Rating = 8, Comment = "Great show" };

        _mockRepository.Setup(repository => repository.AddShowReviewAsync(It.IsAny<Review>()))
            .ReturnsAsync(Result<Review>.Success(review));

        var result = await _reviewService.CreateShowReviewAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(20, result.Data!.ShowId);
    }

    [Fact]
    public async Task UpdateMovieReviewAsync_WhenRepositorySucceeds_ReturnsSuccessResult()
    {
        var userId = 1;
        var request = new MovieReviewRequestDto { MovieId = 10, Rating = 5, Comment = "Updated" };
        var review = new Review { MovieId = 10, UserId = userId, Rating = 5, Comment = "Updated", UpdatedAt = DateTime.UtcNow };

        _mockRepository.Setup(repository => repository.UpdateMovieReviewAsync(It.IsAny<Review>()))
            .ReturnsAsync(Result<Review>.Success(review));

        var result = await _reviewService.UpdateMovieReviewAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(10, result.Data!.MovieId);
        Assert.NotNull(result.Data.UpdatedAt);
    }

    [Fact]
    public async Task UpdateShowReviewAsync_WhenRepositorySucceeds_ReturnsSuccessResult()
    {
        var userId = 1;
        var request = new ShowReviewRequestDto { ShowId = 20, Rating = 7, Comment = "Updated show" };
        var review = new Review { ShowId = 20, UserId = userId, Rating = 7, Comment = "Updated show", UpdatedAt = DateTime.UtcNow };

        _mockRepository.Setup(repository => repository.UpdateShowReviewAsync(It.IsAny<Review>()))
            .ReturnsAsync(Result<Review>.Success(review));

        var result = await _reviewService.UpdateShowReviewAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.Equal(20, result.Data!.ShowId);
    }

    [Fact]
    public async Task GetUserReviewsAsync_WhenRepositorySucceeds_ReturnsMappedReviews()
    {
        var userId = 1;
        var reviews = new List<Review>
        {
            new()
            {
                MovieId = 10,
                UserId = userId,
                Rating = 9,
                Comment = "Movie review",
                CreatedAt = DateTime.UtcNow,
                Movie = new Movie { Title = "Inception", CoverImageUrl = "movie.jpg" }
            },
            new()
            {
                ShowId = 20,
                UserId = userId,
                Rating = 8,
                Comment = "Show review",
                CreatedAt = DateTime.UtcNow,
                Show = new Show { Title = "Dark", CoverImageUrl = "show.jpg" }
            }
        };

        _mockRepository.Setup(repository => repository.GetReviewsByUserIdAsync(userId))
            .ReturnsAsync(reviews);

        var result = await _reviewService.GetUserReviewsAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count());
    }
}