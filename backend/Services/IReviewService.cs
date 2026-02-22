using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;

namespace MovieRating.Backend.Services;

public interface IReviewService
{
    Task<Result<ReviewResponseDto>> CreateReviewAsync(int userId, ReviewRequestDto request);
    Task<Result<ReviewResponseDto>> UpdateReviewAsync(int userId, ReviewRequestDto request);
}