namespace MovieRating.Backend.Models.Dashboard;

public class HomeSectionShow
{
    public int HomeSectionId { get; set; }
    public HomeSection HomeSection { get; set; } = null!;
    
    public int ShowId { get; set; }
    public Show.Show Show { get; set; } = null!;
}