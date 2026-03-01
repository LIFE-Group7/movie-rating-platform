using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Genre;
using MovieRating.Backend.Models.Generic;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Services;

public class GenreServiceTests
{
    private readonly Mock<IGenreRepository> _mockRepo;
    private readonly GenreService _genreService;

    public GenreServiceTests()
    {
        _mockRepo = new Mock<IGenreRepository>();
        _genreService = new GenreService(_mockRepo.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsMappedGenres()
    {
        var genres = new List<Genre>
        {
            new()
            {
                Id = 1,
                Name = "Action",
                isActive = false
            },
            new()
            {
                Id = 2,
                Name = "Drama",
                isActive = false
            }
        };

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(genres);

        var result = await _genreService.GetAllAsync();

        Assert.True(result.IsSuccess);
        var items = result.Data!.ToList();
        Assert.Equal(2, items.Count);
        Assert.Equal("Action", items[0].Name);
        Assert.Equal("Drama", items[1].Name);
    }

    [Fact]
    public async Task GetAllAsync_WhenNoGenres_ReturnsEmptyList()
    {
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Genre>());

        var result = await _genreService.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsMappedGenre()
    {
        var genre = new Genre
        {
            Id = 1,
            Name = "Action",
            isActive = false
        };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(genre);

        var result = await _genreService.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.Id);
        Assert.Equal("Action", result.Data.Name);
    }

    [Fact]
    public async Task GetByIdAsync_WhenDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Genre?)null);

        var result = await _genreService.GetByIdAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WhenSuccessful_ReturnsCreatedGenre()
    {
        var dto = new CreateGenreDto { Name = "Thriller" };
        var createdGenre = new Genre
        {
            Id = 5,
            Name = "Thriller",
            isActive = false
        };

        _mockRepo.Setup(r => r.ExistsByNameAsync("Thriller")).ReturnsAsync(false);
        _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Genre>())).ReturnsAsync(createdGenre);

        var result = await _genreService.CreateAsync(dto);

        Assert.True(result.IsSuccess);
        Assert.Equal(5, result.Data!.Id);
        Assert.Equal("Thriller", result.Data.Name);
    }

    [Fact]
    public async Task CreateAsync_WhenNameIsWhitespace_ReturnsValidationFailure()
    {
        var dto = new CreateGenreDto { Name = "   " };

        var result = await _genreService.CreateAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Type);

        _mockRepo.Verify(r => r.CreateAsync(It.IsAny<Genre>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_WhenNameAlreadyExists_ReturnsConflictFailure()
    {
        var dto = new CreateGenreDto { Name = "Action" };

        _mockRepo.Setup(r => r.ExistsByNameAsync("Action")).ReturnsAsync(true);

        var result = await _genreService.CreateAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Conflict, result.Type);

        _mockRepo.Verify(r => r.CreateAsync(It.IsAny<Genre>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_TrimsWhitespaceFromName()
    {
        var dto = new CreateGenreDto { Name = "  Comedy  " };
        var createdGenre = new Genre
        {
            Id = 6,
            Name = "Comedy",
            isActive = false
        };

        _mockRepo.Setup(r => r.ExistsByNameAsync("Comedy")).ReturnsAsync(false);
        _mockRepo.Setup(r => r.CreateAsync(It.Is<Genre>(g => g.Name == "Comedy"))).ReturnsAsync(createdGenre);

        var result = await _genreService.CreateAsync(dto);

        Assert.True(result.IsSuccess);
        Assert.Equal("Comedy", result.Data!.Name);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WhenSuccessful_ReturnsUpdatedGenre()
    {
        var existingGenre = new Genre
        {
            Id = 1,
            Name = "Action",
            isActive = false
        };
        var dto = new UpdateGenreDto { Name = "Action & Adventure" };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingGenre);
        _mockRepo.Setup(r => r.ExistsByNameAsync("Action & Adventure")).ReturnsAsync(false);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Genre>())).ReturnsAsync(existingGenre);

        var result = await _genreService.UpdateAsync(1, dto);

        Assert.True(result.IsSuccess);
        Assert.Equal("Action & Adventure", result.Data!.Name);
    }

    [Fact]
    public async Task UpdateAsync_WhenGenreDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Genre?)null);

        var result = await _genreService.UpdateAsync(99, new UpdateGenreDto { Name = "New Name" });

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
    }

    [Fact]
    public async Task UpdateAsync_WhenNewNameConflicts_ReturnsConflictFailure()
    {
        var existingGenre = new Genre
        {
            Id = 1,
            Name = "Action",
            isActive = false
        };
        var dto = new UpdateGenreDto { Name = "Drama" };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingGenre);
        _mockRepo.Setup(r => r.ExistsByNameAsync("Drama")).ReturnsAsync(true);

        var result = await _genreService.UpdateAsync(1, dto);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Conflict, result.Type);

        _mockRepo.Verify(r => r.UpdateAsync(It.IsAny<Genre>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WhenNameUnchanged_UpdatesSuccessfully()
    {
        var existingGenre = new Genre
        {
            Id = 1,
            Name = "Action",
            isActive = false
        };
        var dto = new UpdateGenreDto { Name = "Action" };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingGenre);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Genre>())).ReturnsAsync(existingGenre);

        var result = await _genreService.UpdateAsync(1, dto);

        Assert.True(result.IsSuccess);
        Assert.Equal("Action", result.Data!.Name);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WhenExists_ReturnsSuccess()
    {
        var genre = new Genre
        {
            Id = 1,
            Name = "Action",
            isActive = false
        };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(genre);
        _mockRepo.Setup(r => r.DeleteAsync(genre)).Returns(Task.CompletedTask);

        var result = await _genreService.DeleteAsync(1);

        Assert.True(result.IsSuccess);
        _mockRepo.Verify(r => r.DeleteAsync(genre), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenDoesNotExist_ReturnsNotFoundFailure()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Genre?)null);

        var result = await _genreService.DeleteAsync(99);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Type);
        _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<Genre>()), Times.Never);
    }

    #endregion
}
