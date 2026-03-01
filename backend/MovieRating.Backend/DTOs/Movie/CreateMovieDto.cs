using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs.Movie;

public class CreateMovieDto
{
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
    
    public string? CoverImageUrl { get; set; }
    
    public string? BackdropImageUrl { get; set; }   

    public List<int> GenreIds { get; set; } = new List<int>();
}