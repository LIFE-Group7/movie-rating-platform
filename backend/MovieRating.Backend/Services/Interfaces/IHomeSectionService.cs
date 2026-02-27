using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Dashboard;

namespace MovieRating.Backend.Services.Interfaces;

public interface IHomeSectionService
{
    Task<Result<IEnumerable<HomeSectionDto>>> GetAllAsync();
    Task<Result<IEnumerable<HomeSectionDto>>> GetActiveSectionsAsync();
    Task<Result<HomeSectionDto>> GetByIdAsync(int id);
    Task<Result<HomeSectionDto>> CreateAsync(CreateHomeSectionDto sectionDto);
    Task<Result<HomeSectionDto>> UpdateAsync(int id, UpdateHomeSectionDto sectionDto);
    Task<Result> DeleteAsync(int id);
}