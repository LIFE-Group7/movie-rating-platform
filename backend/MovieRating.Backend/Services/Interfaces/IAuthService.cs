using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Models.User;

namespace MovieRating.Backend.Services.Interfaces;

public interface IAuthService
{
    Task<Result<User>> RegisterAsync(RegisterDto request);
    Task<Result<string>> LoginAsync(LoginDto request);
    
    Task<Result<User>> CreateAdminAsync(RegisterDto request);
}