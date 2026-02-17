namespace MovieRating.Backend.Models.Entities;

public class Watchlist
{
    public int UserId { get; set; }
    public User User { get; set; }
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; }
    
    public DateTime AddedAt { get; set; }
}