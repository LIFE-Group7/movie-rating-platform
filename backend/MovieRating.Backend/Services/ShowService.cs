using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class ShowService : IShowService
{
    private readonly IShowRepository _showRepository;

    public ShowService(IShowRepository showRepository)
    {
        _showRepository = showRepository;
    }

    public async Task<Result<IEnumerable<ShowDto>>> GetAllAsync()
    {
        var shows = await _showRepository.GetAllAsync();
        return Result<IEnumerable<ShowDto>>.Success(shows.Select(MapToDto));
    }

    public async Task<Result<ShowDto>> GetByIdAsync(int id)
    {
        var show = await _showRepository.GetByIdAsync(id);
        if (show is null)
            return Result<ShowDto>.Failure("Show not found", ErrorType.NotFound);

        return Result<ShowDto>.Success(MapToDto(show));
    }

    public async Task<Result<IEnumerable<ShowDto>>> GetTopRatedAsync(int count)
    {
        var shows = await _showRepository.GetTopRatedAsync(count);
        return Result<IEnumerable<ShowDto>>.Success(shows.Select(MapToDto));
    }

    public async Task<Result<ShowDto>> CreateAsync(CreateShowDto showDto)
    {
        var show = new Show
        {
            Title = showDto.Title,
            Description = showDto.Description,
            FirstAirDate = showDto.FirstAirDate,
            LastAirDate = showDto.LastAirDate,
            Director = showDto.Creator,
            CoverImageUrl = showDto.CoverImageUrl,
            BackdropImageUrl = showDto.BackdropImageUrl,
            Seasons = showDto.Seasons,
            Episodes = showDto.Episodes,
            Status = showDto.Status,
            AddedAt = DateTime.UtcNow,
            ShowGenres = showDto.GenreIds.Select(id => new ShowGenre
            {
                GenreId = id
            }).ToList()
        };

        var created = await _showRepository.CreateAsync(show);
        return Result<ShowDto>.Success(MapToDto(created));
    }

    public async Task<Result<ShowDto>> UpdateAsync(int id, UpdateShowDto showDto)
    {
        var show = await _showRepository.GetByIdAsync(id);
        if (show is null)
            return Result<ShowDto>.Failure("Show not found", ErrorType.NotFound);

        if (showDto.Title is not null) show.Title = showDto.Title;
        if (showDto.Description is not null) show.Description = showDto.Description;
        if (showDto.FirstAirDate is not null) show.FirstAirDate = showDto.FirstAirDate.Value;
        if (showDto.LastAirDate is not null) show.LastAirDate = showDto.LastAirDate.Value;
        if (showDto.Creator is not null) show.Director = showDto.Creator;
        if (showDto.CoverImageUrl is not null) show.CoverImageUrl = showDto.CoverImageUrl;
        if (showDto.BackdropImageUrl is not null) show.BackdropImageUrl = showDto.BackdropImageUrl;
        if (showDto.Seasons is not null) show.Seasons = showDto.Seasons.Value;
        if (showDto.Episodes is not null) show.Episodes = showDto.Episodes.Value;
        if (showDto.Status is not null) show.Status = showDto.Status.Value;

        if (showDto.GenreIds is not null)
        {
            show.ShowGenres = showDto.GenreIds.Select(genreId => new ShowGenre
            {
                ShowId = show.Id,
                GenreId = genreId
            }).ToList();
        }

        var updated = await _showRepository.UpdateAsync(show);
        return Result<ShowDto>.Success(MapToDto(updated));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var show = await _showRepository.GetByIdAsync(id);
        if (show is null)
            return Result.Failure("Show not found", ErrorType.NotFound);

        await _showRepository.DeleteAsync(show);
        return Result.Success();
    }

    private static ShowDto MapToDto(Show show) => new()
    {
        Id = show.Id,
        Title = show.Title,
        Description = show.Description,
        FirstAirDate = show.FirstAirDate,
        LastAirDate = show.LastAirDate,
        Director = show.Director,
        CoverImageUrl = show.CoverImageUrl,
        BackdropImageUrl = show.BackdropImageUrl,
        AddedAt = show.AddedAt,
        AverageRating = show.AverageRating,
        ReviewCount = show.ReviewCount,
        Seasons = show.Seasons,
        Episodes = show.Episodes,
        Status = show.Status.ToString(),
        Genres = show.ShowGenres.Select(sg => sg.Genre.Name).ToList()
    };
}
