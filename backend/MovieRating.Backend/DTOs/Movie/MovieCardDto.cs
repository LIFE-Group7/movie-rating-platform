namespace MovieRating.Backend.DTOs.Movie;

public class MovieCardDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateOnly ReleaseDate { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? BackdropImageUrl { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}