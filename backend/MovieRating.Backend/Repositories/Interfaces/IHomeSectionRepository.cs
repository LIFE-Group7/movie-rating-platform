using MovieRating.Backend.Models.Dashboard;

namespace MovieRating.Backend.Repositories.Interfaces;

public interface IHomeSectionRepository
{
    Task<IEnumerable<HomeSection>> GetAllAsync();
    
    Task<HomeSection?> GetByIdAsync(int id);
    
    Task<HomeSection> CreateAsync(HomeSection section);
    
    Task<HomeSection> UpdateAsync(HomeSection section);
    
    Task DeleteAsync(HomeSection section);
    
    Task<bool> ExistsAsync(int id);
    
    Task<IEnumerable<HomeSection>> GetActiveSectionsAsync();
}