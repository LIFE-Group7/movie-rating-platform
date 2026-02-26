using MovieRating.Backend.Models.User;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IWatchlistRepository
{
    Task<List<Watchlist>> GetUserWatchlistAsync(int userId);
    Task<int> GetNextPositionAsync(int userId);
    Task<Watchlist?> GetByIdAsync(int id, int userId);
    void Remove(Watchlist watchlist);
    Task ReorderAfterRemovalAsync(int userId, int removedPosition);
    Task<bool> ExistsAsync(int userId, int mediaId, string mediaType);
    Task AddAsync(Watchlist watchlist);
    Task SaveChangesAsync();
}