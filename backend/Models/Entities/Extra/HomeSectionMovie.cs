namespace MovieRating.Backend.Models.Entities;

public class HomeSectionMovie
{
    public int HomeSectionId { get; set; }
    public HomeSection HomeSection { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    
    public int DisplayOrder { get; set; }
}