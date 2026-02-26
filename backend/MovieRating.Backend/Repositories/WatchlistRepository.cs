using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Repositories.Interfaces;

namespace MovieRating.Backend.Repositories;

public class WatchlistRepository(MovieDbContext context) : IWatchlistRepository
{
    public async Task<List<Watchlist>> GetUserWatchlistAsync(int userId)
    {
        return await context.Watchlist
            .Include(w => w.Movie)
            .Include(w => w.Show)
            .Where(w => w.UserId == userId)
            .OrderBy(w => w.Position)
            .ToListAsync();
    }

    public async Task<int> GetNextPositionAsync(int userId)
    {
        var maxPosition = await context.Watchlist
            .Where(w => w.UserId == userId)
            .MaxAsync(w => (int?)w.Position) ?? 0;

        return maxPosition + 1;
    }

    public async Task<Watchlist?> GetByIdAsync(int id, int userId)
    {
        return await context.Watchlist
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
    }

    public void Remove(Watchlist watchlist)
    {
        context.Watchlist.Remove(watchlist);
    }

    public async Task ReorderAfterRemovalAsync(int userId, int removedPosition)
    {
        var itemsToUpdate = await context.Watchlist
            .Where(w => w.UserId == userId && w.Position > removedPosition)
            .ToListAsync();

        foreach (var item in itemsToUpdate)
        {
            item.Position--;
        }
    }

    public async Task<bool> ExistsAsync(int userId, int mediaId, string mediaType)
    {
        if (mediaType.Equals("Movie", StringComparison.OrdinalIgnoreCase))
            return await context.Watchlist.AnyAsync(w => w.UserId == userId && w.MovieId == mediaId);

        if (mediaType.Equals("Show", StringComparison.OrdinalIgnoreCase))
            return await context.Watchlist.AnyAsync(w => w.UserId == userId && w.ShowId == mediaId);

        return false;
    }

    public async Task AddAsync(Watchlist watchlist)
    {
        await context.Watchlist.AddAsync(watchlist);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}