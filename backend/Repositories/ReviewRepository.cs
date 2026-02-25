using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.Repositories;

public class ReviewRepository(MovieDbContext context) : IReviewRepository
{
    public async Task<Result<Review>> AddMovieReviewAsync(Review review)
    {
        if (!review.MovieId.HasValue || review.MovieId.Value <= 0)
        {
            return Result<Review>.Failure("MovieId is required.", ErrorType.Validation);
        }

        if (await context.Movies.FindAsync(review.MovieId.Value) == null)
        {
            return Result<Review>.Failure("Movie not found.", ErrorType.NotFound);
        }

        var hasExistingReview = await context.Reviews
            .AnyAsync(existingReview => existingReview.UserId == review.UserId && existingReview.MovieId == review.MovieId.Value);

        if (hasExistingReview)
        {
            return Result<Review>.Failure("Already reviewed.", ErrorType.Conflict);
        }

        review.ShowId = null;
        await context.Reviews.AddAsync(review);
        await context.SaveChangesAsync();
        await UpdateMovieReviewStatsAsync(review.MovieId.Value);

        return Result<Review>.Success(review);
    }

    public async Task<Result<Review>> UpdateMovieReviewAsync(Review review)
    {
        if (!review.MovieId.HasValue || review.MovieId.Value <= 0)
        {
            return Result<Review>.Failure("MovieId is required.", ErrorType.Validation);
        }

        var existingReview = await context.Reviews
            .FirstOrDefaultAsync(item => item.UserId == review.UserId && item.MovieId == review.MovieId.Value);

        if (existingReview == null)
        {
            return Result<Review>.Failure("Review not found.", ErrorType.NotFound);
        }

        existingReview.Rating = review.Rating;
        existingReview.Comment = review.Comment;
        existingReview.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        await UpdateMovieReviewStatsAsync(review.MovieId.Value);

        return Result<Review>.Success(existingReview);
    }

    public async Task<Result<Review>> AddShowReviewAsync(Review review)
    {
        if (!review.ShowId.HasValue || review.ShowId.Value <= 0)
        {
            return Result<Review>.Failure("ShowId is required.", ErrorType.Validation);
        }

        if (await context.Shows.FindAsync(review.ShowId.Value) == null)
        {
            return Result<Review>.Failure("Show not found.", ErrorType.NotFound);
        }

        var hasExistingReview = await context.Reviews
            .AnyAsync(existingReview => existingReview.UserId == review.UserId && existingReview.ShowId == review.ShowId.Value);

        if (hasExistingReview)
        {
            return Result<Review>.Failure("Already reviewed.", ErrorType.Conflict);
        }

        review.MovieId = null;
        await context.Reviews.AddAsync(review);
        await context.SaveChangesAsync();
        await UpdateShowReviewStatsAsync(review.ShowId.Value);

        return Result<Review>.Success(review);
    }

    public async Task<Result<Review>> UpdateShowReviewAsync(Review review)
    {
        if (!review.ShowId.HasValue || review.ShowId.Value <= 0)
        {
            return Result<Review>.Failure("ShowId is required.", ErrorType.Validation);
        }

        var existingReview = await context.Reviews
            .FirstOrDefaultAsync(item => item.UserId == review.UserId && item.ShowId == review.ShowId.Value);

        if (existingReview == null)
        {
            return Result<Review>.Failure("Review not found.", ErrorType.NotFound);
        }

        existingReview.Rating = review.Rating;
        existingReview.Comment = review.Comment;
        existingReview.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        await UpdateShowReviewStatsAsync(review.ShowId.Value);

        return Result<Review>.Success(existingReview);
    }

    public async Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId)
    {
        var existingReview = await context.Reviews
            .FirstOrDefaultAsync(review => review.UserId == userId && review.MovieId == movieId);

        if (existingReview == null)
        {
            return Result<bool>.Failure("Review not found.", ErrorType.NotFound);
        }

        context.Reviews.Remove(existingReview);
        await context.SaveChangesAsync();
        await UpdateMovieReviewStatsAsync(movieId);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId)
    {
        var existingReview = await context.Reviews
            .FirstOrDefaultAsync(review => review.UserId == userId && review.ShowId == showId);

        if (existingReview == null)
        {
            return Result<bool>.Failure("Review not found.", ErrorType.NotFound);
        }

        context.Reviews.Remove(existingReview);
        await context.SaveChangesAsync();
        await UpdateShowReviewStatsAsync(showId);

        return Result<bool>.Success(true);
    }

    public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(int userId)
    {
        return await context.Reviews
            .Include(review => review.Movie)
            .Include(review => review.Show)
            .Where(review => review.UserId == userId)
            .OrderByDescending(review => review.CreatedAt)
            .ToListAsync();
    }

    private async Task UpdateMovieReviewStatsAsync(int movieId)
    {
        var movieReviewStats = await context.Reviews
            .Where(review => review.MovieId == movieId)
            .GroupBy(review => review.MovieId)
            .Select(group => new { Average = group.Average(review => (double)review.Rating), Count = group.Count() })
            .FirstOrDefaultAsync();

        var movie = await context.Movies.FindAsync(movieId);
        if (movie == null)
        {
            return;
        }

        movie.UpdateReviewStats(movieReviewStats?.Average ?? 0, movieReviewStats?.Count ?? 0);
        await context.SaveChangesAsync();
    }

    private async Task UpdateShowReviewStatsAsync(int showId)
    {
        var showReviewStats = await context.Reviews
            .Where(review => review.ShowId == showId)
            .GroupBy(review => review.ShowId)
            .Select(group => new { Average = group.Average(review => (double)review.Rating), Count = group.Count() })
            .FirstOrDefaultAsync();

        var show = await context.Shows.FindAsync(showId);
        if (show == null)
        {
            return;
        }

        show.UpdateReviewStats(showReviewStats?.Average ?? 0, showReviewStats?.Count ?? 0);
        await context.SaveChangesAsync();
    }
}