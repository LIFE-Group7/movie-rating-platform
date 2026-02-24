using System.ComponentModel.DataAnnotations;

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

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    
    public ICollection<Watchlist> Watchlist { get; set; } = new List<Watchlist>();
}