using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Search;

namespace MovieRating.Backend.Services.Interfaces;

public interface ISearchService
{
    Task<Result<IEnumerable<SearchResultDto>>> SearchGlobalAsync(string query);
}