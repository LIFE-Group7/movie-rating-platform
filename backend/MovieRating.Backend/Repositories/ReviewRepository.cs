using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Repositories.Interfaces;

namespace MovieRating.Backend.Repositories;

public class ReviewRepository(MovieDbContext context) : IReviewRepository
{
    public async Task<IEnumerable<ReviewMovie>> GetMovieReviewsByUserIdAsync(int userId)
    {
        return await context.ReviewMovies
            .Include(r => r.Movie)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt).
            ToListAsync();
    }
    
    public async Task<IEnumerable<ReviewMovie>> GetMovieReviewsAsync(int movieId)
    {
        return await context.ReviewMovies
            .Include(r => r.Movie)
            .Include(r => r.User)
            .Where(r => r.MovieId == movieId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
    
    public async Task<Result<ReviewMovie>> AddMovieReviewAsync(ReviewMovie movieReview)
    {
        if (await context.Movies.FindAsync(movieReview.MovieId) == null){
            return Result<ReviewMovie>
                .Failure("Movie not found.", ErrorType.NotFound);
        }

        if (await context.ReviewMovies.AnyAsync(r => r.UserId == movieReview.UserId && r.MovieId == movieReview.MovieId))
        {
            return Result<ReviewMovie>.Failure("Already reviewed.", ErrorType.Conflict);
        }

        await context.ReviewMovies.AddAsync(movieReview);
        await context.SaveChangesAsync();
        await UpdateMovieReviewStatsAsync(movieReview.MovieId);

        return Result<ReviewMovie>.Success(movieReview);
    }

    public async Task<Result<ReviewMovie>> UpdateMovieReviewAsync(ReviewMovie movieReview)
    {
        var existing = await context.ReviewMovies.FirstOrDefaultAsync
            (r => r.UserId == movieReview.UserId && r.MovieId == movieReview.MovieId);

        if (existing == null)
        {
            return Result<ReviewMovie>.Failure("Review not found.", ErrorType.NotFound);
        }

        existing.Rating = movieReview.Rating;
        existing.Comment = movieReview.Comment;
        existing.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        await UpdateMovieReviewStatsAsync(movieReview.MovieId);

        return Result<ReviewMovie>.Success(existing);
    }
    
    public async Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId)
    {
        var existingReview = await context.ReviewMovies
            .FirstOrDefaultAsync(review => review.UserId == userId && review.MovieId == movieId);

        if (existingReview == null)
        {
            return Result<bool>.Failure("Review not found.", ErrorType.NotFound);
        }

        context.ReviewMovies.Remove(existingReview);
        await context.SaveChangesAsync();
        await UpdateMovieReviewStatsAsync(movieId);

        return Result<bool>.Success(true);
    }

    public async Task<IEnumerable<ReviewShow>> GetShowReviewsByUserIdAsync(int userId)
    {
        return await context.ReviewShows
            .Include(r => r.Show).
            Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt).
            ToListAsync();
    }
    
    public async Task<IEnumerable<ReviewShow>> GetShowReviewsAsync(int showId)
    {
        return await context.ReviewShows
            .Include(r => r.User)
            .Where(r => r.ShowId == showId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
    
    public async Task<Result<ReviewShow>> AddShowReviewAsync(ReviewShow showReview)
    {
        if (await context.Shows.FindAsync(showReview.ShowId) == null){
            return Result<ReviewShow>.Failure("Show not found.", ErrorType.NotFound);
        }

        if (await context.ReviewShows.AnyAsync(sh => sh.UserId == showReview.UserId && sh.ShowId == showReview.ShowId))
        {
            return Result<ReviewShow>.Failure("Already reviewed.", ErrorType.Conflict);
        }

        await context.ReviewShows.AddAsync(showReview);
        await context.SaveChangesAsync();
        await UpdateShowReviewStatsAsync(showReview.ShowId);

        return Result<ReviewShow>.Success(showReview);
    }

    public async Task<Result<ReviewShow>> UpdateShowReviewAsync(ReviewShow showReview)
    {
        var existing = await context.ReviewShows.FirstOrDefaultAsync
            (sh => sh.UserId == showReview.UserId && sh.ShowId == showReview.ShowId);

        if (existing == null)
        {
            return Result<ReviewShow>.Failure("Review not found.", ErrorType.NotFound);
        }

        existing.Rating = showReview.Rating;
        existing.Comment = showReview.Comment;
        existing.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        await UpdateShowReviewStatsAsync(showReview.ShowId);

        return Result<ReviewShow>.Success(existing);
    }

    public async Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId)
    {
        var existingReview = await context.ReviewShows
            .FirstOrDefaultAsync(review => review.UserId == userId && review.ShowId == showId);

        if (existingReview == null)
        {
            return Result<bool>.Failure("Review not found.", ErrorType.NotFound);
        }

        context.ReviewShows.Remove(existingReview);
        await context.SaveChangesAsync();
        await UpdateShowReviewStatsAsync(showId);

        return Result<bool>.Success(true);
    }
    private async Task UpdateMovieReviewStatsAsync(int movieId)
    {
        var stats = await context.ReviewMovies
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
    
    private async Task UpdateShowReviewStatsAsync(int showId)
    {
        var stats = await context.ReviewShows
            .Where(r => r.ShowId == showId)
            .GroupBy(r => r.ShowId)
            .Select(g => new { Average = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();
     
        var show = await context.Shows.FindAsync(showId);
        if (show != null)
        {
            show.UpdateReviewStats(stats?.Average ?? 0, stats?.Count ?? 0);
            await context.SaveChangesAsync();
        }
    }
}
