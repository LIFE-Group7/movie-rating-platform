using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs;

public class MovieReviewRequestDto
{
    [Required(ErrorMessage = "MovieId is required.")]
    public int MovieId { get; set; }

    [Required]
    [Range(1, 10, ErrorMessage = "Rating must be between 1 and 10")]
    public int Rating { get; set; }

    [MaxLength(2000, ErrorMessage = "Comment cannot exceed 2000 characters.")]
    public string? Comment { get; set; }
}

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

public class MovieReviewResponseDto
{
    public int MovieId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ShowReviewResponseDto
{
    public int ShowId { get; set; }
    public int UserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}