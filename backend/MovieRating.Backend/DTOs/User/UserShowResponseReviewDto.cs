namespace MovieRating.Backend.DTOs.User;

public class UserShowResponseReviewDto
{
    public int ShowId { get; set; }
    
    public string ShowTitle { get; set; } = string.Empty;
    
    public int Rating { get; set; }
    
    public string? MovieCoverImageUrl { get; set; }
    
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
}