using MovieRating.Backend.DTOs.Generic;

namespace MovieRating.Backend.DTOs.Show;

public class ShowReviewDto
{
    public int ShowId { get; set; }
    public ReviewAuthorDto Author { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
