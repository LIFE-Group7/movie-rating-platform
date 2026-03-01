namespace MovieRating.Backend.DTOs.Import;

public record TmdbShowDetails(
    int NumberOfSeasons,
    int NumberOfEpisodes,
    string? Status,
    List<TmdbCreator>? CreatedBy
);