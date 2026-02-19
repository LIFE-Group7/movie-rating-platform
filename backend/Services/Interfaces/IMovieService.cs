using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;

namespace MovieRating.Backend.Services.Interfaces;

public interface IMovieService
{
    Task<Result<IEnumerable<MovieDto>>> GetAllAsync();
    Task<Result<MovieDto>> GetByIdAsync(int id);
    Task<Result<MovieDto>> CreateAsync(CreateMovieDto movieDto);
    Task<Result<MovieDto>> UpdateAsync(int id, UpdateMovieDto movieDto);
    Task<Result> DeleteAsync(int id);
}