using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Basics;
using MovieRating.Backend.Repositories.Interfaces;

namespace MovieRating.Backend.Repositories;

public class ReviewRepository(MovieDbContext context) : IReviewRepository
{
    public async Task<Result<Review>> AddReviewAsync(Review review)
    {
        if (await context.Movies.FindAsync(review.MovieId) == null)
        {
            return Result<Review>.Failure("Movie not found.", ErrorType.NotFound);
        }

        if (await context.Reviews.AnyAsync(r => r.UserId == review.UserId && r.MovieId == review.MovieId))
        {
            return Result<Review>.Failure("Already reviewed.", ErrorType.Conflict);
        }

        await context.Reviews.AddAsync(review);
        await context.SaveChangesAsync();
        await UpdateStatsInternalAsync(review.MovieId);

        return Result<Review>.Success(review);
    }

    public async Task<Result<Review>> UpdateReviewAsync(Review review)
    {
        var existing = await context.Reviews.FirstOrDefaultAsync(r => r.UserId == review.UserId && r.MovieId == review.MovieId);

        if (existing == null)
        {
            return Result<Review>.Failure("Review not found.", ErrorType.NotFound);
        }

        existing.Rating = review.Rating;
        existing.Comment = review.Comment;
        existing.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        await UpdateStatsInternalAsync(review.MovieId);

        return Result<Review>.Success(existing);
    }

    private async Task UpdateStatsInternalAsync(int movieId)
    {
        var stats = await context.Reviews
            .Where(r => r.MovieId == movieId)
            .GroupBy(r => r.MovieId)
            .Select(g => new { Average = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();

        var movie = await context.Movies.FindAsync(movieId);
        if (movie != null)
        {
            movie.UpdateReviewStats(stats?.Average ?? 0, stats?.Count ?? 0);
            await context.SaveChangesAsync();
        }
    }
}
