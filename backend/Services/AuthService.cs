using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Exceptions;
using MovieRating.Backend.Models.Entities.Basics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MovieRating.Backend.Services;

public class AuthService(MovieDbContext context, IConfiguration configuration, ILogger<AuthService> logger) : IAuthService
{
    public async Task<Result<User>> RegisterAsync(RegisterDto request)
    {
        try
        {
            // 1. Guard Clauses -> Throw ValidationException
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
                throw new ValidationException($"Email '{request.Email}' is already registered.");

            if (await context.Users.AnyAsync(u => u.Username == request.Username))
                throw new ValidationException($"Username '{request.Username}' is already taken.");

            // 2. Hash Password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Create User
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
        catch (ValidationException ex)
        {
            // Return specific validation message (e.g., "Username taken")
            logger.LogWarning("Registration failed: {Message}", ex.Message);
            return Result<User>.Failure(ex.Message, ErrorType.Conflict);
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
            // 1. Find User -> Throw UserNotFoundException
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null)
            {
                throw new UserNotFoundException(request.Username);
            }

            // 2. Verify Password -> Throw InvalidCredentialsException
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new InvalidCredentialsException();
            }

            // 3. Success Logic
            user.LastLoginAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return Result<string>.Success(token);
        }
        catch (UserNotFoundException ex)
        {
            // SPECIFIC REQUIREMENT: Return "User 'x' was not found"
            logger.LogWarning("Login failed: {Message}", ex.Message);
            return Result<string>.Failure(ex.Message, ErrorType.NotFound);
        }
        catch (InvalidCredentialsException ex)
        {
            // Return "Invalid username or password"
            logger.LogWarning("Login failed: Invalid password for {Username}", request.Username);
            return Result<string>.Failure(ex.Message, ErrorType.Unauthorized);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "System error during login for {Username}", request.Username);
            return Result<string>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    private string GenerateJwtToken(User user)
    {
        var keyVal = configuration["JwtSettings:Key"];

        if (string.IsNullOrEmpty(keyVal))
            throw new AuthException("Server configuration error: JWT Key missing.");

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