using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Basics;

public class Show
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateOnly FirstAirDate { get; set; }

    public DateOnly? LastAirDate { get; set; } // null = still airing

    [MaxLength(150)]
    public string? Creator { get; set; }

    public string? CoverImageUrl { get; set; }

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

    public ICollection<ShowGenre> ShowGenres { get; set; } = new List<ShowGenre>();
}
