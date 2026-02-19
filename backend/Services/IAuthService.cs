using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.Services;

public interface IAuthService
{
    Task<Result<User>> RegisterAsync(RegisterDto request);
    Task<Result<string>> LoginAsync(LoginDto request);
}