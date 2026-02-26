namespace MovieRating.Backend.DTOs.Import;

public record TmdbMovie(
    int Id,
    string Title,
    string? Overview,
    string? ReleaseDate,
    string? PosterPath,
    string? BackdropPath,
    List<int> GenreIds
);

