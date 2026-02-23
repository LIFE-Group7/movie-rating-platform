using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.Services.Interfaces;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.Common;

namespace MovieRating.Backend.Tests.Controllers;

public class MovieControllerTests
{
    private readonly Mock<IMovieService> _mockService;
    private readonly MovieController _controller;

    public MovieControllerTests()
    {
        _mockService = new Mock<IMovieService>();
        _controller = new MovieController(_mockService.Object);
    }

    #region GetAll Tests

    [Fact]
    public async Task GetAll_WhenSuccessful_ReturnsOkWithMovies()
    {
        var mockMovies = new List<MovieDto> { new() { Id = 1, Title = "The Matrix" } };
        _mockService.Setup(s => s.GetAllAsync())
                    .ReturnsAsync(Result<IEnumerable<MovieDto>>.Success(mockMovies));

        var result = await _controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMovies = Assert.IsAssignableFrom<IEnumerable<MovieDto>>(okResult.Value);
        Assert.Single(returnedMovies);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_WhenMovieExists_ReturnsOkWithMovie()
    {
        var movieId = 1;
        var mockMovie = new MovieDto { Id = movieId, Title = "The Matrix" };

        _mockService.Setup(s => s.GetByIdAsync(movieId))
                    .ReturnsAsync(Result<MovieDto>.Success(mockMovie));

        var result = await _controller.GetById(movieId);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMovie = Assert.IsType<MovieDto>(okResult.Value);
        Assert.Equal(movieId, returnedMovie.Id);
    }

    [Fact]
    public async Task GetById_WhenMovieDoesNotExist_ReturnsNotFound()
    {
        var movieId = 99;
        _mockService.Setup(s => s.GetByIdAsync(movieId))
                    .ReturnsAsync(Result<MovieDto>.Failure("Not found", ErrorType.NotFound));

        var result = await _controller.GetById(movieId);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_WhenSuccessful_ReturnsCreatedAtAction()
    {
        var requestDto = new CreateMovieDto { Title = "Inception", DurationMinutes = 148 };
        var responseDto = new MovieDto { Id = 2, Title = "Inception" };

        _mockService.Setup(s => s.CreateAsync(requestDto))
                    .ReturnsAsync(Result<MovieDto>.Success(responseDto));

        var result = await _controller.Create(requestDto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(_controller.GetById), createdResult.ActionName);
        Assert.Equal(2, createdResult.RouteValues?["id"]);
        Assert.Equal(responseDto, createdResult.Value);
    }

    [Fact]
    public async Task Create_WhenValidationFails_ReturnsBadRequest()
    {
        var requestDto = new CreateMovieDto { Title = "Invalid Movie" };

        _mockService.Setup(s => s.CreateAsync(requestDto))
                    .ReturnsAsync(Result<MovieDto>.Failure("Invalid data", ErrorType.Validation));

        var result = await _controller.Create(requestDto);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, objectResult.StatusCode);
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_WhenSuccessful_ReturnsOk()
    {
        var movieId = 1;
        var updateDto = new UpdateMovieDto { Title = "The Matrix Reloaded" };
        var responseDto = new MovieDto { Id = movieId, Title = "The Matrix Reloaded" };

        _mockService.Setup(s => s.UpdateAsync(movieId, updateDto))
                    .ReturnsAsync(Result<MovieDto>.Success(responseDto));

        var result = await _controller.Update(movieId, updateDto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMovie = Assert.IsType<MovieDto>(okResult.Value);
        Assert.Equal("The Matrix Reloaded", returnedMovie.Title);
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task Delete_WhenSuccessful_ReturnsNoContent()
    {
        var movieId = 1;
        _mockService.Setup(s => s.DeleteAsync(movieId))
                    .ReturnsAsync(Result.Success());

        var result = await _controller.Delete(movieId);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WhenMovieNotFound_ReturnsNotFound()
    {
        var movieId = 99;
        _mockService.Setup(s => s.DeleteAsync(movieId))
                    .ReturnsAsync(Result.Failure("Not found", ErrorType.NotFound));

        var result = await _controller.Delete(movieId);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, objectResult.StatusCode);
    }

    #endregion

    #region GetTopRated Tests

    [Fact]
    public async Task GetTopRated_WhenSuccessful_ReturnsOkWithMovies()
    {
        var mockMovies = new List<MovieDto>
        {
            new() { Id = 1, Title = "Godfather", AverageRating = 9.5 },
            new() { Id = 2, Title = "Shawshank Redemption", AverageRating = 9.3 }
        };

        _mockService.Setup(s => s.GetTopRatedMoviesAsync(6))
                    .ReturnsAsync(Result<IEnumerable<MovieDto>>.Success(mockMovies));

        var result = await _controller.GetTopRated();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedMovies = Assert.IsAssignableFrom<IEnumerable<MovieDto>>(okResult.Value);
        Assert.Equal(2, returnedMovies.Count());
    }

    [Fact]
    public async Task GetTopRated_WhenServiceFails_ReturnsInternalServerError()
    {
        _mockService.Setup(s => s.GetTopRatedMoviesAsync(6))
                    .ReturnsAsync(Result<IEnumerable<MovieDto>>.Failure("Database error", ErrorType.Failure));

        var result = await _controller.GetTopRated();

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    #endregion
}