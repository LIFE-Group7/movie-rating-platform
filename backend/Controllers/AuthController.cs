using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Services;

namespace MovieRating.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto request)
    {
        var result = await authService.RegisterAsync(request);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(Login), new { username = result.Data!.Username }, "User registered successfully.");
        }

        return HandleError(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto request)
    {
        var result = await authService.LoginAsync(request);

        if (result.IsSuccess)
        {
            return Ok(new { Token = result.Data });
        }

        return HandleError(result);
    }

    // Helper method to map Error Types to HTTP Status Codes
    private IActionResult HandleError<T>(Result<T> result)
    {
        var statusCode = result.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };

        return Problem(detail: result.Error, statusCode: statusCode);
    }
}