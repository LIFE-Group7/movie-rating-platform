using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IMovieRepository
{
    Task<IEnumerable<Movie>> GetAllAsync();
    Task<Movie?> GetByIdAsync(int id);
    Task<Movie> CreateAsync(Movie movie);
    Task<Movie> UpdateAsync(Movie movie);
    Task DeleteAsync(Movie movie);
    Task<bool> ExistsAsync(int id);
    Task<IEnumerable<Movie>> GetTopRatedAsync(int count);
}