namespace MovieRating.Backend.DTOs.Import;

public record TmdbImportResult(int MoviesImported, int ShowsImported, int GenresCreated);