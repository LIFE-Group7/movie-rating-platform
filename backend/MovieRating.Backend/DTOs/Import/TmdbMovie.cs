namespace MovieRating.Backend.DTOs.Import;

public record TmdbMovie(
    string Title,
    string? Overview,
    string? ReleaseDate,
    string? PosterPath,
    string? BackdropPath,
    List<int> GenreIds
);