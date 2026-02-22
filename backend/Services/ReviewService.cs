using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.Models.Basics;
using MovieRating.Backend.Repositories;

namespace MovieRating.Backend.Services;

public class ReviewService(IReviewRepository repository, ILogger<ReviewService> logger) : IReviewService
{
    public async Task<Result<ReviewResponseDto>> CreateReviewAsync(int userId, ReviewRequestDto request)
    {
        try
        {
            var review = new Review
            {
                UserId = userId,
                MovieId = request.MovieId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var result = await repository.AddReviewAsync(review);

            return result.IsSuccess
                ? Result<ReviewResponseDto>.Success(Map(result.Data!))
                : Result<ReviewResponseDto>.Failure(result.Error!, result.Type);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create review for User {UserId}, Movie {MovieId}", userId, request.MovieId);
            return Result<ReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<ReviewResponseDto>> UpdateReviewAsync(int userId, ReviewRequestDto request)
    {
        try
        {
            var review = new Review
            {
                UserId = userId,
                MovieId = request.MovieId,
                Rating = request.Rating,
                Comment = request.Comment
            };

            var result = await repository.UpdateReviewAsync(review);

            return result.IsSuccess
                ? Result<ReviewResponseDto>.Success(Map(result.Data!))
                : Result<ReviewResponseDto>.Failure(result.Error!, result.Type);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update review for User {UserId}, Movie {MovieId}", userId, request.MovieId);
            return Result<ReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    private static ReviewResponseDto Map(Review r) => new()
    {
        MovieId = r.MovieId,
        UserId = r.UserId,
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt
    };
}