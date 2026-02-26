using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.Exceptions;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class AuthService(MovieDbContext context, IConfiguration configuration, ILogger<AuthService> logger) : IAuthService
{
    public async Task<Result<User>> RegisterAsync(RegisterDto request)
    {
        try
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                logger.LogWarning("Registration failed: Email '{Email}' already exists.", request.Email);
                return Result<User>.Failure($"Email '{request.Email}' is already registered.", ErrorType.Conflict);
            }

            if (await context.Users.AnyAsync(u => u.Username == request.Username))
            {
                logger.LogWarning("Registration failed: Username '{Username}' taken.", request.Username);
                return Result<User>.Failure($"Username '{request.Username}' is already taken.", ErrorType.Conflict);
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = UserRole.User
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return Result<User>.Success(user);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "System error during registration for {Username}", request.Username);
            return Result<User>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<string>> LoginAsync(LoginDto request)
    {
        try
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                // Internal Log: We know the user doesn't exist
                logger.LogWarning("Login failed: User '{Username}' not found.", request.Username);
                return Result<string>.Failure("Invalid username or password.", ErrorType.Unauthorized);
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                // Internal Log: We know the password was wrong
                logger.LogWarning("Login failed: Invalid password for '{Username}'.", request.Username);
                return Result<string>.Failure("Invalid username or password.", ErrorType.Unauthorized);
            }

            user.LastLoginAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return Result<string>.Success(GenerateJwtToken(user));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "System error during login for {Username}", request.Username);
            return Result<string>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<User>> CreateAdminAsync(RegisterDto request)
    {
        try
        {
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                logger.LogWarning("Admin creation failed: Email '{Email}' already exists.", request.Email);
                return Result<User>.Failure($"Email '{request.Email}' is already registered.", ErrorType.Conflict);
            }

            if (await context.Users.AnyAsync(u => u.Username == request.Username))
            {
                logger.LogWarning("Admin creation failed: Username '{Username}' taken.", request.Username);
                return Result<User>.Failure($"Username '{request.Username}' is already taken.", ErrorType.Conflict);
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var admin = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = UserRole.Admin
            };

            context.Users.Add(admin);
            await context.SaveChangesAsync();

            logger.LogInformation("Admin user created: {Username}", admin.Username);
            return Result<User>.Success(admin);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "System error during admin creation for {Username}", request.Username);
            return Result<User>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    private string GenerateJwtToken(User user)
    {
        var keyVal = configuration["JwtSettings:Key"];

        if (string.IsNullOrEmpty(keyVal)) throw new AuthException("Server configuration error: JWT Key missing.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyVal));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: configuration["JwtSettings:Issuer"],
            audience: configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1), 
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}