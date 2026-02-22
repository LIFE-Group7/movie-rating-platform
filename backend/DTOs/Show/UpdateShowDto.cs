using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.DTOs.Show;

public class UpdateShowDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateOnly? FirstAirDate { get; set; }
    public DateOnly? LastAirDate { get; set; }
    public string? Creator { get; set; }
    public string? CoverImageUrl { get; set; }
    public int? Seasons { get; set; }
    public int? Episodes { get; set; }
    public ShowStatus? Status { get; set; }
    public List<int>? GenreIds { get; set; }
}
