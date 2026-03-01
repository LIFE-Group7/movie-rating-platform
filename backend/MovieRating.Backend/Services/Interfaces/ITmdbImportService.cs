using MovieRating.Backend.DTOs.Import;

namespace MovieRating.Backend.Services.Interfaces;

public interface ITmdbImportService
{
    Task<TmdbImportResult> ImportAllAsync(int moviePages = 3, int showPages = 2);
}