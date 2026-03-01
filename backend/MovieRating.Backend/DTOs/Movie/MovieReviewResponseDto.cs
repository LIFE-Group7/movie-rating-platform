namespace MovieRating.Backend.DTOs.Movie;


public class MovieReviewResponseDto
{
    public int MovieId { get; set; }
    
    public int UserId { get; set; }
    
    public int Rating { get; set; }
    
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
}