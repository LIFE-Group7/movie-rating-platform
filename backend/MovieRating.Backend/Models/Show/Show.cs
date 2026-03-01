using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Show;

public class Show
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateOnly FirstAirDate { get; set; }

    public DateOnly? LastAirDate { get; set; }

    [MaxLength(150)]
    public string? Director { get; set; }

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }
    
    [MaxLength(500)]
    public string? BackdropImageUrl { get; set; }

    public DateTime AddedAt { get; set; }

    public double AverageRating { get; private set; }

    public int ReviewCount { get; private set; }

    public int Seasons { get; set; }

    public int Episodes { get; set; }

    public ShowStatus Status { get; set; } = ShowStatus.Ongoing;

    public void UpdateReviewStats(double averageRating, int reviewCount)
    {
        AverageRating = averageRating;
        ReviewCount = reviewCount;
    }

    public ICollection<ReviewShow> ShowReviews { get; set; } = new List<ReviewShow>();
    public ICollection<ShowGenre> ShowGenres { get; set; } = new List<ShowGenre>();
}
