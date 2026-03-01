using MovieRating.Backend.Common;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<IEnumerable<ReviewMovie>> GetMovieReviewsByUserIdAsync(int userId);
    Task<IEnumerable<ReviewMovie>> GetMovieReviewsAsync(int movieId);
    Task<Result<ReviewMovie>> AddMovieReviewAsync(ReviewMovie movieReview);
    Task<Result<ReviewMovie>> UpdateMovieReviewAsync(ReviewMovie movieReview);
    Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId);
    Task<IEnumerable<ReviewShow>> GetShowReviewsByUserIdAsync(int userId);
    Task<IEnumerable<ReviewShow>> GetShowReviewsAsync(int showId);
    Task<Result<ReviewShow>> AddShowReviewAsync(ReviewShow showReview);
    Task<Result<ReviewShow>> UpdateShowReviewAsync(ReviewShow showReview);
    Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId);
}