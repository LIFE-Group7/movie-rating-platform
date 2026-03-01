using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Models.Dashboard;

namespace MovieRating.Backend.DTOs.Dashboard;

public class HomeSectionDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public bool IsHidden { get; set; }
    public bool IncludeMovies { get; set; }
    public bool IncludeShows { get; set; }
    public int MediaLimit { get; set; }
    public HomeSectionSortBy SortBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MovieCardDto>? Movies { get; set; }
    public List<ShowCardDto>? Shows { get; set; }
}