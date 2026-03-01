using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Dashboard;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.DTOs.Show;
using MovieRating.Backend.Models.Dashboard;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class HomeSectionService : IHomeSectionService
{
    private readonly IHomeSectionRepository _homeSectionRepository;

    public HomeSectionService(IHomeSectionRepository homeSectionRepository)
    {
        _homeSectionRepository = homeSectionRepository;
    }

    public async Task<Result<IEnumerable<HomeSectionDto>>> GetAllAsync()
    {
        var sections = await _homeSectionRepository.GetAllAsync();
        return Result<IEnumerable<HomeSectionDto>>.
            Success(sections.Select(s => MapToDto(s)));
    }

    public async Task<Result<IEnumerable<HomeSectionDto>>> GetActiveSectionsAsync()
    {
        var sections = await _homeSectionRepository.GetActiveSectionsWithMediaAsync();
        return Result<IEnumerable<HomeSectionDto>>.
            Success(sections.Select(s => MapToDto(s, true)));
    }

    public async Task<Result<HomeSectionDto>> GetByIdAsync(int id)
    {
        var section = await _homeSectionRepository.GetByIdAsync(id);
        if (section is null)
            return Result<HomeSectionDto>
                .Failure("Section not found", ErrorType.NotFound);

        return Result<HomeSectionDto>
            .Success(MapToDto(section));
    }

    public async Task<Result<HomeSectionDto>> CreateAsync(CreateHomeSectionDto sectionDto)
    {
        var section = new HomeSection()
        {
            Title = sectionDto.Title,
            IsHidden = sectionDto.IsHidden,
            IncludeMovies = sectionDto.IncludeMovies,
            IncludeShows = sectionDto.IncludeShows,
            MediaLimit = sectionDto.MediaLimit,
            SortBy = sectionDto.SortBy
        };

        var created = await _homeSectionRepository.CreateAsync(section);
        return Result<HomeSectionDto>
            .Success(MapToDto(created));
    }

    public async Task<Result<HomeSectionDto>> UpdateAsync(int id, UpdateHomeSectionDto sectionDto)
    {
        var section = await _homeSectionRepository.GetByIdAsync(id);
        if (section is null)
            return Result<HomeSectionDto>.Failure("Section not found", ErrorType.NotFound);

        if (sectionDto.Title is not null)
            section.Title = sectionDto.Title;

        if (sectionDto.IsHidden.HasValue)
            section.IsHidden = sectionDto.IsHidden.Value;

        if (sectionDto.IncludeMovies.HasValue)
            section.IncludeMovies = sectionDto.IncludeMovies.Value;

        if (sectionDto.IncludeShows.HasValue)
            section.IncludeShows = sectionDto.IncludeShows.Value;

        if (sectionDto.MediaLimit.HasValue)
            section.MediaLimit = sectionDto.MediaLimit.Value;

        if (sectionDto.SortBy.HasValue)
            section.SortBy = sectionDto.SortBy.Value;

        await _homeSectionRepository.UpdateAsync(section);
        return Result<HomeSectionDto>.Success(MapToDto(section));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var section = await _homeSectionRepository.GetByIdAsync(id);

        if (section is null)
            return Result.Failure("Section not found", ErrorType.NotFound);

        await _homeSectionRepository.DeleteAsync(section);
        return Result.Success();
    }

    private static HomeSectionDto MapToDto(HomeSection section,
        bool includeMedia = false)
    {
        var dto = new HomeSectionDto
        {
            Id = section.Id,
            Title = section.Title,
            IsHidden = section.IsHidden,
            IncludeMovies = section.IncludeMovies,
            IncludeShows = section.IncludeShows,
            MediaLimit = section.MediaLimit,
            SortBy = section.SortBy,
            CreatedAt = section.CreatedAt
        };

        if (!includeMedia) return dto;

        dto.Movies = section.Movies.Select(hsm => new MovieCardDto
        {
            Id = hsm.Movie.Id,
            Title = hsm.Movie.Title,
            ReleaseDate = hsm.Movie.ReleaseDate,
            CoverImageUrl = hsm.Movie.CoverImageUrl,
            BackdropImageUrl = hsm.Movie.BackdropImageUrl,
            AverageRating = hsm.Movie.AverageRating,
            ReviewCount = hsm.Movie.ReviewCount
        }).ToList();

        dto.Shows = section.Shows.Select(hss => new ShowCardDto
        {
            Id = hss.Show.Id,
            Title = hss.Show.Title,
            FirstAirDate = hss.Show.FirstAirDate,
            CoverImageUrl = hss.Show.CoverImageUrl,
            BackdropImageUrl = hss.Show.BackdropImageUrl,
            AverageRating = hss.Show.AverageRating,
            ReviewCount = hss.Show.ReviewCount,
            Status = hss.Show.Status
        }).ToList();

        return dto;
    }
}