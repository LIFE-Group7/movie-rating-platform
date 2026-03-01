using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Models.Generic;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Services;

public class ShowServiceTests
{
    private readonly Mock<IShowRepository> _mockRepo;
    private readonly ShowService _showService;

    public ShowServiceTests()
    {
        _mockRepo = new Mock<IShowRepository>();
        _showService = new ShowService(_mockRepo.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsMappedShows()
    {
        var mockShows = new List<Show>
        {
            new()
            {
                Id = 1,
                Title = "Foundation",
                FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow),
                ShowGenres = new List<ShowGenre>
                {
                    new() { Genre = new Genre { Name = "Sci-Fi" } }
                }
            }
        };

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(mockShows);

        var result = await _showService.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Contains("Sci-Fi", result.Data!.First().Genres);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsMappedShow()
    {
        var mockShow = new Show
        {
            Id = 1,
            Title = "Severance",
            FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ShowGenres = new List<ShowGenre>
            {
                new() { Genre = new Genre { Name = "Drama" } }
            }
        };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(mockShow);

        var result = await _showService.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.Id);
        Assert.Contains("Drama", result.Data.Genres);
    }

    [Fact]
    public async Task GetByIdAsync_WhenDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Show?)null);

        var result = await _showService.GetByIdAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_SuccessfullyCreatesAndMapsShow()
    {
        var requestDto = new CreateShowDto
        {
            Title = "The Bear",
            GenreIds = new List<int> { 1 }
        };

        var createdShow = new Show
        {
            Id = 5,
            Title = "The Bear",
            FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ShowGenres = new List<ShowGenre>
            {
                new() { Genre = new Genre { Name = "Comedy" } }
            }
        };

        _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Show>())).ReturnsAsync(createdShow);

        var result = await _showService.CreateAsync(requestDto);

        Assert.True(result.IsSuccess);
        Assert.Equal(5, result.Data!.Id);
        Assert.Contains("Comedy", result.Data.Genres);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WhenShowExists_UpdatesAndReturnsMappedShow()
    {
        var existingShow = new Show
        {
            Id = 1,
            Title = "Old Title",
            FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ShowGenres = new List<ShowGenre>
            {
                new() { Genre = new Genre { Name = "Sci-Fi" } }
            }
        };

        var requestDto = new UpdateShowDto { Title = "New Title" };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingShow);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Show>())).ReturnsAsync(existingShow);

        var result = await _showService.UpdateAsync(1, requestDto);

        Assert.True(result.IsSuccess);
        Assert.Equal("New Title", result.Data!.Title);
    }

    [Fact]
    public async Task UpdateAsync_WhenShowDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Show?)null);

        var result = await _showService.UpdateAsync(99, new UpdateShowDto());

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WhenExists_ReturnsSuccess()
    {
        var existingShow = new Show
        {
            Id = 1,
            Title = "To Be Deleted",
            FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingShow);
        _mockRepo.Setup(r => r.DeleteAsync(existingShow)).Returns(Task.CompletedTask);

        var result = await _showService.DeleteAsync(1);

        Assert.True(result.IsSuccess);
        _mockRepo.Verify(r => r.DeleteAsync(existingShow), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Show?)null);

        var result = await _showService.DeleteAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
        _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<Show>()), Times.Never);
    }

    #endregion

    #region GetTopRatedAsync Tests

    [Fact]
    public async Task GetTopRatedAsync_WhenSuccessful_ReturnsMappedShows()
    {
        var topShow = new Show
        {
            Id = 1,
            Title = "Breaking Bad",
            FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ShowGenres = new List<ShowGenre>
            {
                new() { Genre = new Genre { Name = "Drama" } }
            }
        };

        topShow.UpdateReviewStats(9.6, 100);

        var mockShows = new List<Show> { topShow };

        _mockRepo.Setup(r => r.GetTopRatedAsync(6)).ReturnsAsync(mockShows);

        var result = await _showService.GetTopRatedAsync(6);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Equal(9.6, result.Data!.First().AverageRating);
    }

    #endregion
}
