using MovieRating.Backend.Models.Show;

namespace MovieRating.Backend.DTOs.Show;

public class ShowCardDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateOnly FirstAirDate { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? BackdropImageUrl { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public ShowStatus Status { get; set; }
}