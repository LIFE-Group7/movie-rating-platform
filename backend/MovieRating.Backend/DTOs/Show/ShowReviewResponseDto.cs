namespace MovieRating.Backend.DTOs.Show;

public class ShowReviewResponseDto
{
    public int ShowId { get; set; }
    
    public int UserId { get; set; }
    
    public int Rating { get; set; }
    
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
}