using MovieRating.Backend.Common;
using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<Result<Review>> AddReviewAsync(Review review);
    Task<Result<Review>> UpdateReviewAsync(Review review);
    Task<IEnumerable<Review>> GetReviewsByUserIdAsync(int userId);
}