using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Services;

public class SearchServiceTests
{
    private readonly Mock<IMovieRepository> _mockMovieRepo;
    private readonly Mock<IShowRepository> _mockShowRepo;
    private readonly Mock<ILogger<SearchService>> _mockLogger;
    private readonly SearchService _searchService;

    public SearchServiceTests()
    {
        _mockMovieRepo = new Mock<IMovieRepository>();
        _mockShowRepo = new Mock<IShowRepository>();
        _mockLogger = new Mock<ILogger<SearchService>>();

        _searchService = new SearchService(
            _mockMovieRepo.Object,
            _mockShowRepo.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task SearchGlobalAsync_WhenQueryIsNullOrWhiteSpace_ReturnsEmptyList()
    {
        var result = await _searchService.SearchGlobalAsync("   ");

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);

        _mockMovieRepo.Verify(r => r.SearchAsync(It.IsAny<string>()), Times.Never);
        _mockShowRepo.Verify(r => r.SearchAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task SearchGlobalAsync_WhenSuccessful_CombinesMapsAndSortsResults()
    {
        var mockMovie = new Movie
        {
            Id = 1,
            Title = "Batman Begins",
            ReleaseDate = new DateOnly(2005, 6, 15)
        };
        mockMovie.UpdateReviewStats(8.5, 100);

        var mockShow = new Show
        {
            Id = 1,
            Title = "Batman: The Animated Series",
            FirstAirDate = new DateOnly(1992, 9, 5)
        };
        mockShow.UpdateReviewStats(9.0, 500);

        _mockMovieRepo.Setup(r => r.SearchAsync("Batman")).ReturnsAsync(new List<Movie> { mockMovie });
        _mockShowRepo.Setup(r => r.SearchAsync("Batman")).ReturnsAsync(new List<Show> { mockShow });

        var result = await _searchService.SearchGlobalAsync("Batman");

        Assert.True(result.IsSuccess);
        var resultsList = result.Data!.ToList();

        Assert.Equal(2, resultsList.Count);

        Assert.Equal("Show", resultsList[0].Type);
        Assert.Equal("Batman: The Animated Series", resultsList[0].Title);
        Assert.Equal(1992, resultsList[0].ReleaseYear);

        Assert.Equal("Movie", resultsList[1].Type);
        Assert.Equal("Batman Begins", resultsList[1].Title);
        Assert.Equal(2005, resultsList[1].ReleaseYear);
    }

    [Fact]
    public async Task SearchGlobalAsync_WhenExceptionThrown_ReturnsFailureAndLogsError()
    {
        _mockMovieRepo.Setup(r => r.SearchAsync("Batman"))
                      .ThrowsAsync(new Exception("Database connection failed"));

        var result = await _searchService.SearchGlobalAsync("Batman");

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
}