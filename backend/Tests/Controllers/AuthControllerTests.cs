using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieRating.Backend.Common;
using MovieRating.Backend.Controllers;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Models.Basics;
using MovieRating.Backend.Services;
using Xunit;

namespace MovieRating.Backend.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockService = new Mock<IAuthService>();
        _controller = new AuthController(_mockService.Object);
    }

    #region Register Tests

    [Fact]
    public async Task Register_WhenSuccessful_ReturnsCreatedAtAction()
    {
        var request = new RegisterDto
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "StrongPass123!"
        };

        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        _mockService.Setup(s => s.RegisterAsync(request))
            .ReturnsAsync(Result<User>.Success(user));

        var result = await _controller.Register(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(_controller.Login), createdResult.ActionName);
        Assert.Equal("testuser", createdResult.RouteValues?["username"]);
        Assert.Equal("User registered successfully.", createdResult.Value);
    }

    [Fact]
    public async Task Register_WhenConflict_ReturnsConflict()
    {
        var request = new RegisterDto
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "StrongPass123!"
        };

        _mockService.Setup(s => s.RegisterAsync(request))
            .ReturnsAsync(Result<User>.Failure("User already exists", ErrorType.Conflict));

        var result = await _controller.Register(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    #endregion

    #region Login Tests

    [Fact]
    public async Task Login_WhenSuccessful_ReturnsOkWithToken()
    {
        var request = new LoginDto
        {
            Username = "testuser",
            Password = "StrongPass123!"
        };

        _mockService.Setup(s => s.LoginAsync(request))
            .ReturnsAsync(Result<string>.Success("jwt-token"));

        var result = await _controller.Login(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var tokenProperty = okResult.Value?.GetType().GetProperty("Token");
        var tokenValue = tokenProperty?.GetValue(okResult.Value) as string;
        Assert.Equal("jwt-token", tokenValue);
    }

    [Fact]
    public async Task Login_WhenUnauthorized_ReturnsUnauthorized()
    {
        var request = new LoginDto
        {
            Username = "testuser",
            Password = "WrongPass123!"
        };

        _mockService.Setup(s => s.LoginAsync(request))
            .ReturnsAsync(Result<string>.Failure("Invalid credentials", ErrorType.Unauthorized));

        var result = await _controller.Login(request);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status401Unauthorized, objectResult.StatusCode);
    }

    #endregion
}
