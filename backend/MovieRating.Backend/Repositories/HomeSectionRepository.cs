using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Dashboard;
using MovieRating.Backend.Repositories.Interfaces;

namespace MovieRating.Backend.Repositories;

public class HomeSectionRepository : IHomeSectionRepository
{
    private readonly MovieDbContext _context;
    
    public HomeSectionRepository(MovieDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<HomeSection>> GetAllAsync()
    {
        return await _context.HomeSections
            .Include(hs => hs.Genre)
            .OrderByDescending(hs => hs.CreatedAt)
            .ToListAsync();
    }

    public async Task<HomeSection?> GetByIdAsync(int id)
    {
        return await _context.HomeSections
            .Include(hs => hs.Genre)
            .FirstOrDefaultAsync(hs => hs.Id == id);
    }

    public async Task<HomeSection> CreateAsync(HomeSection section)
    {
        _context.HomeSections.Add(section);
        await _context.SaveChangesAsync();
        return section;
    }

    public async Task<HomeSection> UpdateAsync(HomeSection section)
    {
        _context.HomeSections.Update(section);
        await _context.SaveChangesAsync();
        return section;
    }

    public async Task DeleteAsync(HomeSection section)
    {
        _context.HomeSections.Remove(section);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.HomeSections
            .AnyAsync(hs => hs.Id == id);
    }

    public async Task<IEnumerable<HomeSection>> GetActiveSectionsAsync()
    {
        return await _context.HomeSections
            .Include(hs => hs.Genre)
            .Where(hs => hs.IsActive)
            .OrderByDescending(hs => hs.CreatedAt)
            .ToListAsync();
    }
}