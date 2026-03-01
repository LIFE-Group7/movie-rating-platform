using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.DTOs.User;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repository;
    private readonly ILogger<ReviewService> _logger;
    
    public ReviewService(IReviewRepository repository, ILogger<ReviewService> logger)
    {
        _repository = repository;
        this._logger = logger;
    }
    
    public async Task<Result<MovieReviewResponseDto>> CreateMovieReviewAsync(int userId, MovieReviewRequestDto request)
    {
        try
        {
            var review = new ReviewMovie()
            {
                UserId = userId,
                MovieId = request.MovieId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var creationResult = await _repository.AddMovieReviewAsync(review);

            return creationResult.IsSuccess
                ? Result<MovieReviewResponseDto>.Success(MapMovieReview(creationResult.Data!))
                : Result<MovieReviewResponseDto>.Failure(creationResult.Error!, creationResult.Type);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to create movie review for User {UserId}, Movie {MovieId}", userId, request.MovieId);
            return Result<MovieReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<MovieReviewResponseDto>> UpdateMovieReviewAsync(int userId, MovieReviewRequestDto request)
    {
        try
        {
            var review = new ReviewMovie()
            {
                UserId = userId,
                MovieId = request.MovieId,
                Rating = request.Rating,
                Comment = request.Comment
            };

            var updateResult = await _repository.UpdateMovieReviewAsync(review);

            return updateResult.IsSuccess
                ? Result<MovieReviewResponseDto>.Success(MapMovieReview(updateResult.Data!))
                : Result<MovieReviewResponseDto>.Failure(updateResult.Error!, updateResult.Type);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to update movie review for User {UserId}, Movie {MovieId}", userId, request.MovieId);
            return Result<MovieReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }
    
    public async Task<Result<IEnumerable<UserMovieResponseReviewDto>>> GetMovieUserReviewsAsync(int userId)
    {
        try
        {
            var reviews = await _repository.GetMovieReviewsByUserIdAsync(userId);

            var reviewItems = reviews.Select(review => new UserMovieResponseReviewDto()
            {
                MovieId = review.MovieId,
                MovieTitle = review.Movie.Title,
                MovieCoverImageUrl = review.Movie.CoverImageUrl,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            }).ToList();

            return Result<IEnumerable<UserMovieResponseReviewDto>>.Success(reviewItems);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to retrieve reviews for User {UserId}", userId);
            return Result<IEnumerable<UserMovieResponseReviewDto>>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }
    
    public async Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId)
    {
        try
        {
            return await _repository.DeleteMovieReviewAsync(userId, movieId);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to delete movie review for User {UserId}, Movie {MovieId}", userId, movieId);
            return Result<bool>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }
    
    public async Task<Result<ShowReviewResponseDto>> CreateShowReviewAsync(int userId, ShowReviewRequestDto request)
    {
        try
        {
            var review = new ReviewShow()
            {
                UserId = userId,
                ShowId = request.ShowId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var creationResult = await _repository.AddShowReviewAsync(review);

            return creationResult.IsSuccess
                ? Result<ShowReviewResponseDto>.Success(MapShowReview(creationResult.Data!))
                : Result<ShowReviewResponseDto>.Failure(creationResult.Error!, creationResult.Type);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to create show review for User {UserId}, Show {ShowId}", userId, request.ShowId);
            return Result<ShowReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<ShowReviewResponseDto>> UpdateShowReviewAsync(int userId, ShowReviewRequestDto request)
    {
        try
        {
            var review = new ReviewShow()
            {
                UserId = userId,
                ShowId = request.ShowId,
                Rating = request.Rating,
                Comment = request.Comment
            };

            var updateResult = await _repository.UpdateShowReviewAsync(review);

            return updateResult.IsSuccess
                ? Result<ShowReviewResponseDto>.Success(MapShowReview(updateResult.Data!))
                : Result<ShowReviewResponseDto>.Failure(updateResult.Error!, updateResult.Type);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to update show review for User {UserId}, Show {ShowId}", userId, request.ShowId);
            return Result<ShowReviewResponseDto>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<IEnumerable<UserShowResponseReviewDto>>> GetShowUserReviewsAsync(int userId)
    {
        try
        {
            var reviews = await _repository.GetShowReviewsByUserIdAsync(userId);

            var reviewItems = reviews.Select(review => new UserShowResponseReviewDto()
            {
                ShowId = review.ShowId,
                ShowTitle= review.Show.Title,
                MovieCoverImageUrl = review.Show.CoverImageUrl,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            }).ToList();

            return Result<IEnumerable<UserShowResponseReviewDto>>.Success(reviewItems);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to retrieve reviews for User {UserId}", userId);
            return Result<IEnumerable<UserShowResponseReviewDto>>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    public async Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId)
    {
        try
        {
            return await _repository.DeleteShowReviewAsync(userId, showId);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to delete show review for User {UserId}, Show {ShowId}", userId, showId);
            return Result<bool>.Failure("An unexpected error occurred.", ErrorType.Failure);
        }
    }

    private static MovieReviewResponseDto MapMovieReview(ReviewMovie movieReview) => new()
    {
        MovieId = movieReview.MovieId,
        UserId = movieReview.UserId,
        Rating = movieReview.Rating,
        Comment = movieReview.Comment,
        CreatedAt = movieReview.CreatedAt,
        UpdatedAt = movieReview.UpdatedAt
    };

    private static ShowReviewResponseDto MapShowReview(ReviewShow showReview) => new()
    {
        ShowId = showReview.ShowId,
        UserId = showReview.UserId,
        Rating = showReview.Rating,
        Comment = showReview.Comment,
        CreatedAt = showReview.CreatedAt,
        UpdatedAt = showReview.UpdatedAt
    };
}