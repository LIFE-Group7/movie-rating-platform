using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Services;

namespace MovieRating.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto request)
    {
        try
        {
            var result = await authService.RegisterAsync(request);

            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(Login), new { username = result.Data!.Username }, "User registered successfully.");
            }

            return HandleError(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception in Register endpoint.");
            return Problem("Internal Server Error", statusCode: 500);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto request)
    {
        try
        {
            var result = await authService.LoginAsync(request);

            if (result.IsSuccess)
            {
                return Ok(new { Token = result.Data });
            }

            return HandleError(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception in Login endpoint.");
            return Problem("Internal Server Error", statusCode: 500);
        }
    }

    // Helper method to map Service Errors to HTTP Status Codes
    private IActionResult HandleError<T>(Result<T> result)
    {
        var details = new ProblemDetails { Detail = result.Error };

        return result.Type switch
        {
            ErrorType.Conflict => Conflict(details),        // 409
            ErrorType.Validation => BadRequest(details),    // 400
            ErrorType.Unauthorized => Unauthorized(details),// 401
            ErrorType.NotFound => NotFound(details),        // 404
            _ => StatusCode(500, "An unexpected error occurred.")
        };
    }
}