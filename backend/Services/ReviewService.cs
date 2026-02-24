using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

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

    public async Task<Result<IEnumerable<UserReviewResponseDto>>> GetUserReviewsAsync(int userId)
    {
        try
        {
            var reviews = await repository.GetReviewsByUserIdAsync(userId);

            var dtos = reviews.Select(r => new UserReviewResponseDto
            {
                MovieId = r.MovieId,
                MovieTitle = r.Movie.Title,
                MovieCoverImageUrl = r.Movie.CoverImageUrl,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return Result<IEnumerable<UserReviewResponseDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve reviews for User {UserId}", userId);
            return Result<IEnumerable<UserReviewResponseDto>>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }
}