using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : BaseApiController
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto request)
    {
        // Pass the request to the service layer to handle the actual database and business logic
        var result = await authService.RegisterAsync(request);

        if (result.IsSuccess)
        {
            // Return a 201 Created status and point the client to the Login endpoint
            return CreatedAtAction(nameof(Login), new { username = result.Data!.Username }, "User registered successfully.");
        }

        // If something fails (e.g., email already exists), the base class handles the error formatting
        return HandleError(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto request)
    {
        var result = await authService.LoginAsync(request);

        if (result.IsSuccess)
        {
            // On success, package and return the authentication token
            return Ok(new { Token = result.Data });
        }

        return HandleError(result);
    }

    // Development only: Shortcut to create an admin user for testing (not exposed in production)
    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin(RegisterDto request)
    {
        var result = await authService.CreateAdminAsync(request);

        if (result.IsSuccess)
        {
            return Ok(new 
            { 
                Message = "Admin user created successfully",
                Username = result.Data!.Username,
                Email = result.Data.Email
            });
        }

        return HandleError(result);
    }
}