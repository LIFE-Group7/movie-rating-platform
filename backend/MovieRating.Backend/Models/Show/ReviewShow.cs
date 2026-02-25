using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Show;

public class ReviewShow
{
    public int UserId { get; set; }
    public User.User User { get; set; } = null!;
    
    public int ShowId { get; set; }
    public Show Show { get; set; } = null!;
    
    [Range(1, 10)]
    public int Rating { get; set; }
    
    [MaxLength(2000)]
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
}