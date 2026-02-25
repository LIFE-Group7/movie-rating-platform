using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Movie;

public class ReviewMovie
{
    public int UserId { get; set; }
    public User.User User { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    
    [Range(1, 10)]
    public int Rating { get; set; }
    
    [MaxLength(2000)]
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
}