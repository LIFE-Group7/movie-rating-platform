namespace MovieRating.Backend.DTOs.Import;

public record TmdbShow(
    int Id,
    string Name,
    string? Overview,
    string? FirstAirDate,
    string? PosterPath,
    string? BackdropPath,
    List<int> GenreIds
);