using Microsoft.Extensions.Logging;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.Models.Generic;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Services;

public class MovieServiceTests
{
    private readonly Mock<IMovieRepository> _mockRepo;
    private readonly Mock<ILogger<MovieService>> _mockLogger;
    private readonly MovieService _movieService;

    public MovieServiceTests()
    {
        _mockRepo = new Mock<IMovieRepository>();
        _mockLogger = new Mock<ILogger<MovieService>>();
        _movieService = new MovieService(_mockRepo.Object, _mockLogger.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsMappedMovies()
    {
        var mockMovies = new List<Movie>
        {
            new() { Id = 1, Title = "Movie 1", MovieGenres = new List<MovieGenre>() }
        };

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(mockMovies);

        var result = await _movieService.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Equal("Movie 1", result.Data!.First().Title);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsMappedMovie()
    {
        var mockMovie = new Movie { Id = 1, Title = "Movie 1", MovieGenres = new List<MovieGenre>() };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(mockMovie);

        var result = await _movieService.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.Id);
    }

    [Fact]
    public async Task GetByIdAsync_WhenDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Movie?)null);

        var result = await _movieService.GetByIdAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_SuccessfullyCreatesAndMapsMovie()
    {
        var requestDto = new CreateMovieDto
        {
            Title = "New Movie",
            GenreIds = new List<int> { 1, 2 }
        };

        var createdMovie = new Movie { Id = 5, Title = "New Movie" };
        var completeMovie = new Movie
        {
            Id = 5,
            Title = "New Movie",
            MovieGenres = new List<MovieGenre>
            {
                new() { Genre = new Genre { Id = 1, Name = "Action" } }
            }
        };

        _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Movie>())).ReturnsAsync(createdMovie);
        _mockRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(completeMovie);

        var result = await _movieService.CreateAsync(requestDto);

        Assert.True(result.IsSuccess);
        Assert.Equal(5, result.Data!.Id);
        Assert.Contains("Action", result.Data.Genres);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WhenMovieExists_UpdatesAndReturnsMappedMovie()
    {
        var existingMovie = new Movie { Id = 1, Title = "Old Title", MovieGenres = new List<MovieGenre>() };
        var requestDto = new UpdateMovieDto { Title = "New Title" };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingMovie);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Movie>())).ReturnsAsync(existingMovie);

        var result = await _movieService.UpdateAsync(1, requestDto);

        Assert.True(result.IsSuccess);
        Assert.Equal("New Title", result.Data!.Title);
    }

    [Fact]
    public async Task UpdateAsync_WhenMovieDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Movie?)null);

        var result = await _movieService.UpdateAsync(99, new UpdateMovieDto());

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WhenExists_ReturnsSuccess()
    {
        var existingMovie = new Movie { Id = 1, Title = "To Be Deleted" };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingMovie);
        _mockRepo.Setup(r => r.DeleteAsync(existingMovie)).Returns(Task.CompletedTask);

        var result = await _movieService.DeleteAsync(1);

        Assert.True(result.IsSuccess);
        _mockRepo.Verify(r => r.DeleteAsync(existingMovie), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Movie?)null);

        var result = await _movieService.DeleteAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
        _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<Movie>()), Times.Never);
    }

    #endregion

    #region GetTopRatedMoviesAsync Tests

    [Fact]
    public async Task GetTopRatedMoviesAsync_WhenSuccessful_ReturnsMappedMovies()
    {
        var topMovie = new Movie { Id = 1, Title = "Top Movie", MovieGenres = new List<MovieGenre>() };

        topMovie.UpdateReviewStats(9.5, 100);

        var mockMovies = new List<Movie> { topMovie };

        _mockRepo.Setup(r => r.GetTopRatedAsync(6)).ReturnsAsync(mockMovies);

        var result = await _movieService.GetTopRatedMoviesAsync(6);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Equal(9.5, result.Data!.First().AverageRating);
    }

    [Fact]
    public async Task GetTopRatedMoviesAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        _mockRepo.Setup(r => r.GetTopRatedAsync(6))
                 .ThrowsAsync(new Exception("Database connection failed"));

        var result = await _movieService.GetTopRatedMoviesAsync(6);

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