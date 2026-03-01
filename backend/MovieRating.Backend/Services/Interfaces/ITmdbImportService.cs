using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Import;

namespace MovieRating.Backend.Services.Interfaces;

public interface ITmdbImportService
{
    Task<Result<TmdbImportResult>> ImportAllAsync(int moviePages = 3, int showPages = 2);
}