using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class WatchlistService(IWatchlistRepository watchlistRepo, MovieDbContext context) : IWatchlistService
{
    public async Task<Result<List<WatchlistItemDto>>> GetWatchlistAsync(int userId)
    {
        var items = await watchlistRepo.GetUserWatchlistAsync(userId);

        var dtoList = items.Select(w => new WatchlistItemDto
        {
            WatchlistId = w.Id,
            Position = w.Position,
            AddedAt = w.AddedAt,
            MediaType = w.MovieId.HasValue ? "Movie" : "Show",
            MediaId = w.MovieId ?? w.ShowId ?? 0,
            Title = w.MovieId.HasValue ? w.Movie!.Title : w.Show!.Title,
            CoverImageUrl = w.MovieId.HasValue ? w.Movie!.CoverImageUrl : w.Show!.CoverImageUrl,
            AverageRating = w.MovieId.HasValue ? w.Movie!.AverageRating : w.Show!.AverageRating
        }).ToList();

        return Result<List<WatchlistItemDto>>.Success(dtoList);
    }

    public async Task<Result> AddToWatchlistAsync(int userId, AddToWatchlistDto request)
    {
        if (await watchlistRepo.ExistsAsync(userId, request.MediaId, request.MediaType))
        {
            return Result.Failure("Item is already in your watchlist.", ErrorType.Conflict);
        }

        if (request.MediaType.Equals("Movie", StringComparison.OrdinalIgnoreCase))
        {
            var movieExists = await context.Movies.AnyAsync(m => m.Id == request.MediaId);
            if (!movieExists) return Result.Failure("Movie not found.", ErrorType.NotFound);
        }
        else if (request.MediaType.Equals("Show", StringComparison.OrdinalIgnoreCase))
        {
            var showExists = await context.Shows.AnyAsync(s => s.Id == request.MediaId);
            if (!showExists) return Result.Failure("Show not found.", ErrorType.NotFound);
        }
        else
        {
            return Result.Failure("Invalid media type. Must be 'Movie' or 'Show'.", ErrorType.Validation);
        }

        var nextPosition = await watchlistRepo.GetNextPositionAsync(userId);

        var watchlistItem = new Watchlist
        {
            UserId = userId,
            MovieId = request.MediaType.Equals("Movie", StringComparison.OrdinalIgnoreCase) ? request.MediaId : null,
            ShowId = request.MediaType.Equals("Show", StringComparison.OrdinalIgnoreCase) ? request.MediaId : null,
            Position = nextPosition
        };

        await watchlistRepo.AddAsync(watchlistItem);
        await watchlistRepo.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> RemoveFromWatchlistAsync(int userId, int watchlistId)
    {
        var item = await watchlistRepo.GetByIdAsync(watchlistId, userId);
        if (item == null)
        {
            return Result.Failure("Watchlist item not found.", ErrorType.NotFound);
        }

        var removedPosition = item.Position;

        watchlistRepo.Remove(item);

        await watchlistRepo.ReorderAfterRemovalAsync(userId, removedPosition);

        await watchlistRepo.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<bool>> CheckItemStatusAsync(int userId, int mediaId, string mediaType)
    {
        if (mediaType != "Movie" && mediaType != "Show")
        {
            return Result<bool>.Failure("Invalid media type.", ErrorType.Validation);
        }

        var exists = await watchlistRepo.ExistsAsync(userId, mediaId, mediaType);
        return Result<bool>.Success(exists);
    }
}