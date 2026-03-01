using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Services.Interfaces;
using System.Security.Claims;
using Xunit;

namespace MovieRating.Backend.Tests.Controllers;

public class WatchlistControllerTests
{
    private readonly Mock<IWatchlistService> _mockService;
    private readonly WatchlistController _controller;

    public WatchlistControllerTests()
    {
        _mockService = new Mock<IWatchlistService>();
        _controller = new WatchlistController(_mockService.Object);

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "1") };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    #region GetWatchlist Tests

    [Fact]
    public async Task GetWatchlist_WhenSuccessful_ReturnsOkWithWatchlist()
    {
        var mockData = new List<WatchlistItemDto>
        {
            new WatchlistItemDto { WatchlistId = 1, MediaId = 10, MediaType = "Movie", Title = "The Matrix" }
        };

        _mockService.Setup(s => s.GetWatchlistAsync(1))
            .ReturnsAsync(Result<List<WatchlistItemDto>>.Success(mockData));

        var result = await _controller.GetWatchlist();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<List<WatchlistItemDto>>(okResult.Value);
        Assert.Single(returnValue);
        Assert.Equal("The Matrix", returnValue.First().Title);
    }

    [Fact]
    public async Task GetWatchlist_WhenServiceFails_ReturnsHandledError()
    {
        _mockService.Setup(s => s.GetWatchlistAsync(1))
            .ReturnsAsync(Result<List<WatchlistItemDto>>.Failure("Failed to retrieve", ErrorType.NotFound));

        var result = await _controller.GetWatchlist();

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    #endregion

    #region AddToWatchlist Tests

    [Fact]
    public async Task AddToWatchlist_WhenSuccessful_ReturnsOkWithMessage()
    {
        var request = new AddToWatchlistDto { MediaId = 10, MediaType = "Movie" };

        _mockService.Setup(s => s.AddToWatchlistAsync(1, request))
            .ReturnsAsync(Result.Success());

        var result = await _controller.AddToWatchlist(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var messageProperty = okResult.Value?.GetType().GetProperty("Message");
        var messageValue = messageProperty?.GetValue(okResult.Value) as string;

        Assert.Equal("Added to watchlist successfully.", messageValue);
    }

    [Fact]
    public async Task AddToWatchlist_WhenConflict_ReturnsHandledError()
    {
        var request = new AddToWatchlistDto { MediaId = 10, MediaType = "Movie" };

        _mockService.Setup(s => s.AddToWatchlistAsync(1, request))
            .ReturnsAsync(Result.Failure("Item already exists.", ErrorType.Conflict));

        var result = await _controller.AddToWatchlist(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    #endregion

    #region RemoveFromWatchlist Tests

    [Fact]
    public async Task RemoveFromWatchlist_WhenSuccessful_ReturnsNoContent()
    {
        var watchlistId = 5;
        _mockService.Setup(s => s.RemoveFromWatchlistAsync(1, watchlistId))
            .ReturnsAsync(Result.Success());

        var result = await _controller.RemoveFromWatchlist(watchlistId);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task RemoveFromWatchlist_WhenNotFound_ReturnsHandledError()
    {
        var watchlistId = 5;
        _mockService.Setup(s => s.RemoveFromWatchlistAsync(1, watchlistId))
            .ReturnsAsync(Result.Failure("Not found.", ErrorType.NotFound));

        var result = await _controller.RemoveFromWatchlist(watchlistId);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    #endregion

    #region CheckStatus Tests

    [Fact]
    public async Task CheckStatus_WhenSuccessful_ReturnsOkWithStatus()
    {
        var mediaId = 10;
        var mediaType = "Movie";

        _mockService.Setup(s => s.CheckItemStatusAsync(1, mediaId, mediaType))
            .ReturnsAsync(Result<bool>.Success(true));

        var result = await _controller.CheckStatus(mediaType, mediaId);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var isInWatchlistProp = okResult.Value?.GetType().GetProperty("IsInWatchlist");
        var isInWatchlistValue = (bool?)isInWatchlistProp?.GetValue(okResult.Value);

        Assert.True(isInWatchlistValue);
    }

    [Fact]
    public async Task CheckStatus_WhenInvalidMediaType_ReturnsHandledError()
    {
        var mediaId = 10;
        var mediaType = "InvalidType";

        _mockService.Setup(s => s.CheckItemStatusAsync(1, mediaId, mediaType))
            .ReturnsAsync(Result<bool>.Failure("Invalid type.", ErrorType.Validation));

        var result = await _controller.CheckStatus(mediaType, mediaId);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, objectResult.StatusCode);
    }

    #endregion
}
