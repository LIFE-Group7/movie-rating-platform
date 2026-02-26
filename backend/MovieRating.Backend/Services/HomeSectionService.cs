using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Dashboard;
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
        return Result<IEnumerable<HomeSectionDto>>.Success(sections.Select(MapToDto));
    }

    public async Task<Result<IEnumerable<HomeSectionDto>>> GetActiveSectionsAsync()
    {
        var sections = await _homeSectionRepository.GetActiveSectionsAsync();
        return Result<IEnumerable<HomeSectionDto>>.Success(sections.Select(MapToDto));
    }

    public async Task<Result<HomeSectionDto>> GetByIdAsync(int id)
    {
        var section = await _homeSectionRepository.GetByIdAsync(id);
        if (section is null)
            return Result<HomeSectionDto>.Failure("Section not found", ErrorType.NotFound);
        
        return Result<HomeSectionDto>.Success(MapToDto(section));
    }

    public async Task<Result<HomeSectionDto>> CreateAsync(CreateHomeSectionDto sectionDto)
    {
        var section = new HomeSection()
        {
            Title = sectionDto.Title,
            IsActive = sectionDto.IsActive
        };

        var created = await _homeSectionRepository.CreateAsync(section);
        return Result<HomeSectionDto>.Success(MapToDto(created));
    }

    public async Task<Result<HomeSectionDto>> UpdateAsync(int id, UpdateHomeSectionDto sectionDto)
    {
        var section = await _homeSectionRepository.GetByIdAsync(id);
        if(section is null)
            return Result<HomeSectionDto>.Failure("Section not found", ErrorType.NotFound);
        
        section.Title = sectionDto.Title;
        section.IsActive = sectionDto.IsActive;
        
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
    
    private static HomeSectionDto MapToDto(HomeSection section)
    {
        return new HomeSectionDto
        {
            Id = section.Id,
            Title = section.Title,
            IsActive = section.IsActive,
            CreatedAt = section.CreatedAt
        };
    }
}