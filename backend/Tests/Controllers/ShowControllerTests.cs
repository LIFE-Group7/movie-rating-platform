using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Services.Interfaces;
using Xunit;

namespace MovieRating.Backend.Tests.Controllers;

public class ShowControllerTests
{
    private readonly Mock<IShowService> _mockService;
    private readonly ShowController _controller;

    public ShowControllerTests()
    {
        _mockService = new Mock<IShowService>();
        _controller = new ShowController(_mockService.Object);
    }

    #region GetAll Tests

    [Fact]
    public async Task GetAll_WhenSuccessful_ReturnsOkWithShows()
    {
        var mockShows = new List<ShowDto> { new() { Id = 1, Title = "The Expanse" } };
        _mockService.Setup(s => s.GetAllAsync())
            .ReturnsAsync(Result<IEnumerable<ShowDto>>.Success(mockShows));

        var result = await _controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedShows = Assert.IsAssignableFrom<IEnumerable<ShowDto>>(okResult.Value);
        Assert.Single(returnedShows);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_WhenShowExists_ReturnsOkWithShow()
    {
        var showId = 1;
        var mockShow = new ShowDto { Id = showId, Title = "The Expanse" };

        _mockService.Setup(s => s.GetByIdAsync(showId))
            .ReturnsAsync(Result<ShowDto>.Success(mockShow));

        var result = await _controller.GetById(showId);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedShow = Assert.IsType<ShowDto>(okResult.Value);
        Assert.Equal(showId, returnedShow.Id);
    }

    [Fact]
    public async Task GetById_WhenShowDoesNotExist_ReturnsNotFound()
    {
        var showId = 99;
        _mockService.Setup(s => s.GetByIdAsync(showId))
            .ReturnsAsync(Result<ShowDto>.Failure("Not found", ErrorType.NotFound));

        var result = await _controller.GetById(showId);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_WhenSuccessful_ReturnsCreatedAtAction()
    {
        var requestDto = new CreateShowDto { Title = "Severance" };
        var responseDto = new ShowDto { Id = 2, Title = "Severance" };

        _mockService.Setup(s => s.CreateAsync(requestDto))
            .ReturnsAsync(Result<ShowDto>.Success(responseDto));

        var result = await _controller.Create(requestDto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(_controller.GetById), createdResult.ActionName);
        Assert.Equal(2, createdResult.RouteValues?["id"]);
        Assert.Equal(responseDto, createdResult.Value);
    }

    [Fact]
    public async Task Create_WhenValidationFails_ReturnsBadRequest()
    {
        var requestDto = new CreateShowDto { Title = "Invalid Show" };

        _mockService.Setup(s => s.CreateAsync(requestDto))
            .ReturnsAsync(Result<ShowDto>.Failure("Invalid data", ErrorType.Validation));

        var result = await _controller.Create(requestDto);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, objectResult.StatusCode);
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_WhenSuccessful_ReturnsOk()
    {
        var showId = 1;
        var updateDto = new UpdateShowDto { Title = "The Expanse: Season 2" };
        var responseDto = new ShowDto { Id = showId, Title = "The Expanse: Season 2" };

        _mockService.Setup(s => s.UpdateAsync(showId, updateDto))
            .ReturnsAsync(Result<ShowDto>.Success(responseDto));

        var result = await _controller.Update(showId, updateDto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedShow = Assert.IsType<ShowDto>(okResult.Value);
        Assert.Equal("The Expanse: Season 2", returnedShow.Title);
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task Delete_WhenSuccessful_ReturnsNoContent()
    {
        var showId = 1;
        _mockService.Setup(s => s.DeleteAsync(showId))
            .ReturnsAsync(Result.Success());

        var result = await _controller.Delete(showId);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WhenShowNotFound_ReturnsNotFound()
    {
        var showId = 99;
        _mockService.Setup(s => s.DeleteAsync(showId))
            .ReturnsAsync(Result.Failure("Not found", ErrorType.NotFound));

        var result = await _controller.Delete(showId);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    #endregion

    #region GetTopRated Tests

    [Fact]
    public async Task GetTopRated_WhenSuccessful_ReturnsOkWithShows()
    {
        var mockShows = new List<ShowDto>
        {
            new() { Id = 1, Title = "Breaking Bad", AverageRating = 9.6 },
            new() { Id = 2, Title = "Better Call Saul", AverageRating = 9.0 }
        };

        _mockService.Setup(s => s.GetTopRatedAsync(6))
            .ReturnsAsync(Result<IEnumerable<ShowDto>>.Success(mockShows));

        var result = await _controller.GetTopRated();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedShows = Assert.IsAssignableFrom<IEnumerable<ShowDto>>(okResult.Value);
        Assert.Equal(2, returnedShows.Count());
    }

    [Fact]
    public async Task GetTopRated_WhenServiceFails_ReturnsInternalServerError()
    {
        _mockService.Setup(s => s.GetTopRatedAsync(6))
            .ReturnsAsync(Result<IEnumerable<ShowDto>>.Failure("Database error", ErrorType.Failure));

        var result = await _controller.GetTopRated();

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    #endregion
}
