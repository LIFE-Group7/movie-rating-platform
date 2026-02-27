using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;

namespace MovieRating.Backend.DTOs.Dashboard;


public class PublicHomeSectionDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public List<MovieDto> Movies { get; set; } = new();
    public List<ShowDto> Shows { get; set; } = new();
}