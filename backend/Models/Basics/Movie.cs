using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Extra;

namespace MovieRating.Backend.Models.Basics;

public class Movie
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateOnly ReleaseDate { get; set; }

    [MaxLength(150)]
    public string? Director { get; set; }

    [Range(1, 600)]
    public int DurationMinutes { get; set; }

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    [MaxLength(500)]
    public string? BackdropImageUrl { get; set; }

    public DateTime AddedAt { get; set; }

    public double AverageRating { get; private set; }

    public int ReviewCount { get; private set; }

    public void UpdateReviewStats(double averageRating, int reviewCount)
    {
        AverageRating = averageRating;
        ReviewCount = reviewCount;
    }

    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    public ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();

    public ICollection<Watchlist> Watchlist { get; set; } = new List<Watchlist>();
}