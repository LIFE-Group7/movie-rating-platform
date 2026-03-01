using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Genre;

namespace MovieRating.Backend.Services.Interfaces;

public interface IGenreService
{
    Task<Result<IEnumerable<GenreDto>>> GetAllAsync();
    Task<Result<IEnumerable<GenreDto>>> GetActiveAsync();
    Task<Result<GenreDto>> GetByIdAsync(int id);
    Task<Result<GenreDto>> CreateAsync(CreateGenreDto genreDto);
    Task<Result<GenreDto>> UpdateAsync(int id, UpdateGenreDto genreDto);
}