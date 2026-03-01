using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.DTOs.Generic;
using MovieRating.Backend.Services.Interfaces;
using Xunit;

namespace MovieRating.Backend.Tests.Controllers;

public class SearchControllerTests
{
    private readonly Mock<ISearchService> _mockSearchService;
    private readonly SearchController _controller;

    public SearchControllerTests()
    {
        _mockSearchService = new Mock<ISearchService>();
        _controller = new SearchController(_mockSearchService.Object);
    }

    [Fact]
    public async Task Search_WhenQueryIsNullOrWhiteSpace_ReturnsOkWithEmptyList()
    {
        var result = await _controller.Search("   ");

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);

        Assert.Empty(returnedData);
        _mockSearchService.Verify(s => s.SearchGlobalAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Search_WhenSuccessful_ReturnsOkWithResults()
    {
        var mockResults = new List<SearchResultDto>
        {
            new() { Id = 1, Title = "The Matrix", Type = "Movie" }
        };

        _mockSearchService.Setup(s => s.SearchGlobalAsync("Matrix"))
                          .ReturnsAsync(Result<IEnumerable<SearchResultDto>>.Success(mockResults));

        var result = await _controller.Search("Matrix");

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedData = Assert.IsAssignableFrom<IEnumerable<SearchResultDto>>(okResult.Value);

        Assert.Single(returnedData);
        Assert.Equal("The Matrix", returnedData.First().Title);
    }

    [Fact]
    public async Task Search_WhenServiceFails_ReturnsInternalServerError()
    {
        _mockSearchService.Setup(s => s.SearchGlobalAsync("Matrix"))
                          .ReturnsAsync(Result<IEnumerable<SearchResultDto>>.Failure("Error", ErrorType.Failure));

        var result = await _controller.Search("Matrix");

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }
}