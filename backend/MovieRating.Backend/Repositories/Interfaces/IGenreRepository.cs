using MovieRating.Backend.Models.Generic;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IGenreRepository
{
    Task<IEnumerable<Genre>> GetAllAsync();
    Task<Genre?> GetByIdAsync(int id);
    Task<Genre> CreateAsync(Genre genre);
    Task<Genre> UpdateAsync(Genre genre);
    Task DeleteAsync(Genre genre);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExistsByNameAsync(string name);
}