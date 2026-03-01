namespace MovieRating.Backend.Models.Dashboard;

public class HomeSectionMovie
{
    public int HomeSectionId { get; set; }
    public HomeSection HomeSection { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie.Movie Movie { get; set; } = null!;
}