using MovieRating.Backend.DTOs.Generic;

namespace MovieRating.Backend.DTOs.Movie;

public class MovieReviewDto
{
    public int MovieId { get; set; }
    public ReviewAuthorDto Author { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
