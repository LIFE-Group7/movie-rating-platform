namespace MovieRating.Backend.DTOs.Import;

public record TmdbMovieDetails(
    int Runtime,
    TmdbCredits? Credits
);