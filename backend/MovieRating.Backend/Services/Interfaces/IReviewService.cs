using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.DTOs.User;

namespace MovieRating.Backend.Services.Interfaces;

public interface IReviewService
{
    Task<Result<IEnumerable<UserMovieResponseReviewDto>>> GetMovieUserReviewsAsync(int userId);
    Task<Result<IEnumerable<MovieReviewDto>>> GetMovieReviewsAsync(int movieId);
    Task<Result<MovieReviewResponseDto>> CreateMovieReviewAsync(int userId, MovieReviewRequestDto request);
    Task<Result<MovieReviewResponseDto>> UpdateMovieReviewAsync(int userId, MovieReviewRequestDto request);
    Task<Result<bool>> DeleteMovieReviewAsync(int userId, int movieId);
    Task<Result<IEnumerable<UserShowResponseReviewDto>>> GetShowUserReviewsAsync(int userId);
    Task<Result<IEnumerable<ShowReviewDto>>> GetShowReviewsAsync(int showId);
    Task<Result<ShowReviewResponseDto>> CreateShowReviewAsync(int userId, ShowReviewRequestDto request);
    Task<Result<ShowReviewResponseDto>> UpdateShowReviewAsync(int userId, ShowReviewRequestDto request);
    Task<Result<bool>> DeleteShowReviewAsync(int userId, int showId);
}