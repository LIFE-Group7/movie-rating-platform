namespace MovieRating.Backend.DTOs.User.Watchlist;

public class WatchlistItemDto
{
    public int WatchlistId { get; set; }
    public int Position { get; set; }
    public DateTime AddedAt { get; set; }

    public string MediaType { get; set; } // "Movie" or "Show"
    public int MediaId { get; set; }
    public string Title { get; set; }
    public string? CoverImageUrl { get; set; }
    public double AverageRating { get; set; }
}

public class AddToWatchlistDto
{
    public int MediaId { get; set; }
    public string MediaType { get; set; } // "Movie" or "Show"
}