using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.DTOs.Reviews;
using MovieRating.Backend.Models.Basics;
using MovieRating.Backend.Repositories;

namespace MovieRating.Backend.Services;

public class ReviewService(IReviewRepository repository, ILogger<ReviewService> logger) : IReviewService
{
    public async Task<Result<MovieReviewResponseDto>> CreateMovieReviewAsync(int userId, MovieReviewRequestDto request)
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

            var creationResult = await repository.AddMovieReviewAsync(review);

            return creationResult.IsSuccess
                ? Result<MovieReviewResponseDto>.Success(MapMovieReview(creationResult.Data!))
                : Result<MovieReviewResponseDto>.Failure(creationResult.Error!, creationResult.Type);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to create movie review for User {UserId}, Movie {MovieId}", userId, request.MovieId);
            return Result<MovieReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<MovieReviewResponseDto>> UpdateMovieReviewAsync(int userId, MovieReviewRequestDto request)
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

            var updateResult = await repository.UpdateMovieReviewAsync(review);

            return updateResult.IsSuccess
                ? Result<MovieReviewResponseDto>.Success(MapMovieReview(updateResult.Data!))
                : Result<MovieReviewResponseDto>.Failure(updateResult.Error!, updateResult.Type);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to update movie review for User {UserId}, Movie {MovieId}", userId, request.MovieId);
            return Result<MovieReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<ShowReviewResponseDto>> CreateShowReviewAsync(int userId, ShowReviewRequestDto request)
    {
        try
        {
            var review = new Review
            {
                UserId = userId,
                ShowId = request.ShowId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var creationResult = await repository.AddShowReviewAsync(review);

            return creationResult.IsSuccess
                ? Result<ShowReviewResponseDto>.Success(MapShowReview(creationResult.Data!))
                : Result<ShowReviewResponseDto>.Failure(creationResult.Error!, creationResult.Type);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to create show review for User {UserId}, Show {ShowId}", userId, request.ShowId);
            return Result<ShowReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<ShowReviewResponseDto>> UpdateShowReviewAsync(int userId, ShowReviewRequestDto request)
    {
        try
        {
            var review = new Review
            {
                UserId = userId,
                ShowId = request.ShowId,
                Rating = request.Rating,
                Comment = request.Comment
            };

            var updateResult = await repository.UpdateShowReviewAsync(review);

            return updateResult.IsSuccess
                ? Result<ShowReviewResponseDto>.Success(MapShowReview(updateResult.Data!))
                : Result<ShowReviewResponseDto>.Failure(updateResult.Error!, updateResult.Type);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to update show review for User {UserId}, Show {ShowId}", userId, request.ShowId);
            return Result<ShowReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<IEnumerable<UserReviewResponseDto>>> GetUserReviewsAsync(int userId)
    {
        try
        {
            var reviews = await repository.GetReviewsByUserIdAsync(userId);

            var reviewItems = reviews.Select(review => new UserReviewResponseDto
            {
                MovieId = review.MovieId ?? review.ShowId ?? 0,
                Type = review.ShowId.HasValue ? "show" : "movie",
                MovieTitle = review.Movie?.Title ?? review.Show?.Title ?? string.Empty,
                MovieCoverImageUrl = review.Movie?.CoverImageUrl ?? review.Show?.CoverImageUrl,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            }).ToList();

            return Result<IEnumerable<UserReviewResponseDto>>.Success(reviewItems);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to retrieve reviews for User {UserId}", userId);
            return Result<IEnumerable<UserReviewResponseDto>>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId)
    {
        try
        {
            return await repository.DeleteMovieReviewAsync(userId, movieId);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to delete movie review for User {UserId}, Movie {MovieId}", userId, movieId);
            return Result<bool>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId)
    {
        try
        {
            return await repository.DeleteShowReviewAsync(userId, showId);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to delete show review for User {UserId}, Show {ShowId}", userId, showId);
            return Result<bool>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    private static MovieReviewResponseDto MapMovieReview(Review review) => new()
    {
        MovieId = review.MovieId ?? 0,
        UserId = review.UserId,
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt,
        UpdatedAt = review.UpdatedAt
    };

    private static ShowReviewResponseDto MapShowReview(Review review) => new()
    {
        ShowId = review.ShowId ?? 0,
        UserId = review.UserId,
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt,
        UpdatedAt = review.UpdatedAt
    };
}