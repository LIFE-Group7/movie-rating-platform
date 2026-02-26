using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.User.Watchlist;

namespace MovieRating.Backend.Services.Interfaces;

public interface IWatchlistService
{
    Task<Result<List<WatchlistItemDto>>> GetWatchlistAsync(int userId);
    Task<Result> AddToWatchlistAsync(int userId, AddToWatchlistDto request);
    Task<Result> RemoveFromWatchlistAsync(int userId, int watchlistId);
    Task<Result<bool>> CheckItemStatusAsync(int userId, int mediaId, string mediaType);
}