namespace MovieRating.Backend.Services.Interfaces;

public record TmdbImportResult(int MoviesImported, int ShowsImported, int GenresCreated);

public interface ITmdbImportService
{
    /// <summary>Imports popular movies and TV shows from TMDB into the local database.</summary>
    /// <param name="moviePages">Number of TMDB pages to fetch for movies (20 results per page).</param>
    /// <param name="showPages">Number of TMDB pages to fetch for shows (20 results per page).</param>
    Task<TmdbImportResult> ImportAllAsync(int moviePages = 3, int showPages = 2);
}