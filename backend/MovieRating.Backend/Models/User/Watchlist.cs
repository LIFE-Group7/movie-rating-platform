namespace MovieRating.Backend.Models.User;

public class Watchlist
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? MovieId { get; set; }
    public Movie.Movie? Movie { get; set; }

    public int? ShowId { get; set; }
    public Show.Show? Show { get; set; }

    public DateTime AddedAt { get; set; }

    public int Position { get; set; }
}