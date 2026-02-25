namespace MovieRating.Backend.Models.User;

public class Watchlist
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie.Movie Movie { get; set; } = null!;
    
    public DateTime AddedAt { get; set; }
}