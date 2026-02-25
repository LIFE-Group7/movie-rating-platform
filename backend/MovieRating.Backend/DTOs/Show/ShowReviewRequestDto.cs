using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs.Show;

public class ShowReviewRequestDto
{
    [Required(ErrorMessage = "ShowId is required.")]
    public int ShowId { get; set; }

    [Required]
    [Range(1, 10, ErrorMessage = "Rating must be between 1 and 10")]
    public int Rating { get; set; }

    [MaxLength(2000, ErrorMessage = "Comment cannot exceed 2000 characters.")]
    public string? Comment { get; set; }
}