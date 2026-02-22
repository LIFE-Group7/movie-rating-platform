using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.DTOs.Show;

public class ShowDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly FirstAirDate { get; set; }
    public DateOnly? LastAirDate { get; set; }
    public string? Creator { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime AddedAt { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int Seasons { get; set; }
    public int Episodes { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Genres { get; set; } = new();
}
