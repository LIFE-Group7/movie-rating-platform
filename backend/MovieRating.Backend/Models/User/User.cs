using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;

namespace MovieRating.Backend.Models.User;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public required string Username { get; set; }
    
    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public required string Email  { get; set; }
    
    [Required]
    [MaxLength(128)]
    public required string PasswordHash { get; set; }

    public UserRole Role { get; set; } = UserRole.User;
    
    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }

    public ICollection<ReviewMovie> MovieReviews { get; set; } = new List<ReviewMovie>();
    
    public ICollection<ReviewShow> ShowReviews { get; set; } = new List<ReviewShow>();
    
    public ICollection<Watchlist> Watchlist { get; set; } = new List<Watchlist>();
}