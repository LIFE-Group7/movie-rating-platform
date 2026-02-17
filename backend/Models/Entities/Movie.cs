using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Entities;

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
    
    public double ReviewCount { get; private set; }

    public void UpdateReviewStats(double averageRating, double reviewCount)
    {
        AverageRating = averageRating;
        ReviewCount = reviewCount;
    }

    public ICollection<Review> Reviews = new List<Review>();
    public ICollection<MovieGenre> MovieGenres = new List<MovieGenre>();
}