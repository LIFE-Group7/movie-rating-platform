namespace MovieRating.Backend.DTOs.User;

public class UserMovieResponseReviewDto
{
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public string? MovieCoverImageUrl { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}