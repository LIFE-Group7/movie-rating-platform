using Microsoft.Extensions.Logging;
using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Search;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class SearchService : ISearchService
{
    private readonly IMovieRepository _movieRepo;
    private readonly IShowRepository _showRepo;
    private readonly ILogger<SearchService> _logger;

    public SearchService(IMovieRepository movieRepo, IShowRepository showRepo, ILogger<SearchService> logger)
    {
        _movieRepo = movieRepo;
        _showRepo = showRepo;
        _logger = logger;
    }

    public async Task<Result<IEnumerable<SearchResultDto>>> SearchGlobalAsync(string query)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Result<IEnumerable<SearchResultDto>>.Success(Enumerable.Empty<SearchResultDto>());
            }

            // 1. Run the queries sequentially instead of concurrently!
            var movies = await _movieRepo.SearchAsync(query);
            var shows = await _showRepo.SearchAsync(query);

            // 2. Map Movies to the shared DTO
            var movieResults = movies.Select(m => new SearchResultDto
            {
                Id = m.Id,
                Title = m.Title,
                CoverImageUrl = m.CoverImageUrl,
                AverageRating = m.AverageRating,
                ReviewCount = m.ReviewCount,
                Type = "Movie",
                ReleaseYear = m.ReleaseDate.Year
            });

            // 3. Map Shows to the shared DTO
            var showResults = shows.Select(s => new SearchResultDto
            {
                Id = s.Id,
                Title = s.Title,
                CoverImageUrl = s.CoverImageUrl,
                AverageRating = s.AverageRating,
                ReviewCount = s.ReviewCount,
                Type = "Show",
                ReleaseYear = s.FirstAirDate.Year
            });

            // 4. Combine them and apply the sorting logic
            var combinedResults = movieResults.Concat(showResults)
                .OrderByDescending(x => x.AverageRating)
                .ThenByDescending(x => x.ReviewCount)
                .ToList();

            return Result<IEnumerable<SearchResultDto>>.Success(combinedResults);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute global search for term: {Query}", query);
            return Result<IEnumerable<SearchResultDto>>.Failure("An error occurred while searching.", ErrorType.Failure);
        }
    }
}