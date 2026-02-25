using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs;
using MovieRating.Backend.DTOs.Reviews;

namespace MovieRating.Backend.Services;

public interface IReviewService
{
    Task<Result<MovieReviewResponseDto>> CreateMovieReviewAsync(int userId, MovieReviewRequestDto request);
    Task<Result<MovieReviewResponseDto>> UpdateMovieReviewAsync(int userId, MovieReviewRequestDto request);
    Task<Result<ShowReviewResponseDto>> CreateShowReviewAsync(int userId, ShowReviewRequestDto request);
    Task<Result<ShowReviewResponseDto>> UpdateShowReviewAsync(int userId, ShowReviewRequestDto request);
    Task<Result<IEnumerable<UserReviewResponseDto>>> GetUserReviewsAsync(int userId);
    Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId);
    Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId);
}