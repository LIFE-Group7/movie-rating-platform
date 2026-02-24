namespace MovieRating.Backend.DTOs.Generic;

public class SearchResultDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public string Type { get; set; } = string.Empty;
    public int? ReleaseYear { get; set; }
}