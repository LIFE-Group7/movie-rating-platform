namespace MovieRating.Backend.DTOs.Movie;

public class MovieDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly ReleaseDate { get; set; }
    public string? Director { get; set; }
    public int DurationMinutes { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? BackdropImageUrl { get; set; }
    public DateTime AddedAt { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public List<string> Genres { get; set; } = new List<string>();
}