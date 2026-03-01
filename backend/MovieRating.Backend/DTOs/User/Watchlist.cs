namespace MovieRating.Backend.DTOs.User;

public class WatchlistItemDto
{
    public int WatchlistId { get; set; }
    public int Position { get; set; }
    public DateTime AddedAt { get; set; }

    public required string MediaType { get; set; } // "Movie" or "Show"
    public int MediaId { get; set; }
    public required string Title { get; set; }
    public string? CoverImageUrl { get; set; }
    public double AverageRating { get; set; }
}

public class AddToWatchlistDto
{
    public int MediaId { get; set; }
    public required string MediaType { get; set; } // "Movie" or "Show"
}