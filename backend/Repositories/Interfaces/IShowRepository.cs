using MovieRating.Backend.Models.Show;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IShowRepository
{
    Task<IEnumerable<Show>> GetAllAsync();
    Task<Show?> GetByIdAsync(int id);
    Task<IEnumerable<Show>> GetTopRatedAsync(int count);
    Task<Show> CreateAsync(Show show);
    Task<Show> UpdateAsync(Show show);
    Task DeleteAsync(Show show);
    Task<bool> ExistsAsync(int id);
    Task<IEnumerable<Show>> SearchAsync(string searchTerm);
}
