using MovieRating.Backend.Models.Entities.Basics;

namespace MovieRating.Backend.Models.Entities.Extra;

public class Watchlist
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    
    public DateTime AddedAt { get; set; }
}