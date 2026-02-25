using MovieRating.Backend.Common;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Models.User;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<Result<ReviewMovie>> AddMovieReviewAsync(ReviewMovie movieReview);
    Task<Result<ReviewMovie>> UpdateMovieReviewAsync(ReviewMovie movieReview);
    Task<IEnumerable<ReviewMovie>> GetMovieReviewsByUserIdAsync(int userId);
    Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId);
    Task<Result<ReviewShow>> AddShowReviewAsync(ReviewShow showReview);
    Task<Result<ReviewShow>> UpdateShowReviewAsync(ReviewShow showReview);
    Task<IEnumerable<ReviewShow>> GetShowReviewsByUserIdAsync(int userId);
    Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId);
}