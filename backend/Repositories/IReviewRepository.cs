using MovieRating.Backend.Common;
using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.Repositories;

public interface IReviewRepository
{
    Task<Result<Review>> AddMovieReviewAsync(Review review);
    Task<Result<Review>> UpdateMovieReviewAsync(Review review);
    Task<Result<Review>> AddShowReviewAsync(Review review);
    Task<Result<Review>> UpdateShowReviewAsync(Review review);
    Task<IEnumerable<Review>> GetReviewsByUserIdAsync(int userId);
    Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId);
    Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId);
}