using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Repositories.Interfaces;

namespace MovieRating.Backend.Repositories;

public class ShowRepository : IShowRepository
{
    private readonly MovieDbContext _context;

    public ShowRepository(MovieDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Show>> GetAllAsync()
    {
        return await _context.Shows
            .Include(s => s.ShowGenres)
            .ThenInclude(sg => sg.Genre)
            .ToListAsync();
    }

    public async Task<Show?> GetByIdAsync(int id)
    {
        return await _context.Shows
            .Include(s => s.ShowGenres)
            .ThenInclude(sg => sg.Genre)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Show>> GetTopRatedAsync(int count)
    {
        return await _context.Shows
            .Include(s => s.ShowGenres)
            .ThenInclude(sg => sg.Genre)
            .OrderByDescending(s => s.AverageRating)
            .Take(count)
            .ToListAsync();
    }

    public async Task<Show> CreateAsync(Show show)
    {
        _context.Shows.Add(show);
        await _context.SaveChangesAsync();
        return show;
    }

    public async Task<Show> UpdateAsync(Show show)
    {
        _context.Shows.Update(show);
        await _context.SaveChangesAsync();
        return show;
    }

    public async Task DeleteAsync(Show show)
    {
        _context.Shows.Remove(show);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Shows.AnyAsync(s => s.Id == id);
    }
    public async Task<IEnumerable<Show>> SearchAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm)) return new List<Show>();

        return await _context.Shows
            .Include(s => s.ShowGenres)
            .ThenInclude(sg => sg.Genre)
            .Where(s => s.Title.Contains(searchTerm))
            .ToListAsync();
    }
}
