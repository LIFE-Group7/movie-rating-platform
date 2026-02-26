namespace MovieRating.Backend.DTOs.Dashboard;

public class HomeSectionDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public int? GenreId { get; set; }
    public string? GenreName { get; set; }
    public int? MinYear { get; set; }
    public decimal? MinRating { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}