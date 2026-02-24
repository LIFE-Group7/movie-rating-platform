using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs.User;

public class ReviewRequestDto
{
    [Required(ErrorMessage = "MovieId is required.")]
    public int MovieId { get; set; }

    [Required]
    [Range(1, 10, ErrorMessage = "Rating must be between 1 and 10")]
    public int Rating { get; set; }

    [MaxLength(2000, ErrorMessage = "Comment cannot exceed 2000 characters.")]
    public string? Comment { get; set; }
}

public class ReviewResponseDto
{
    public int MovieId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}