using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Entities.Extra;

namespace MovieRating.Backend.Models.Entities.Basics;

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
    
    public int DurationMinutes {get; set;}
    
    public string? CoverImageUrl { get; set; }
    
    public DateTime AddedAt { get; set; }
    
    public double AverageRating { get; private set; }
    
    public int ReviewCount { get; private set; }

    public void UpdateReviewStats(double averageRating, int reviewCount)
    {
        AverageRating = averageRating;
        ReviewCount = reviewCount;
    }

    public ICollection<Review> Reviews = new List<Review>();
    
    public ICollection<MovieGenre> MovieGenres = new List<MovieGenre>();
    
    public ICollection<Watchlist> Watchlist = new List<Watchlist>();
}