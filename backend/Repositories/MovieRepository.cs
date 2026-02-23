using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Basics;
using MovieRating.Backend.Repositories.Interfaces;

namespace MovieRating.Backend.Repositories;

public class MovieRepository : IMovieRepository
{
    private readonly MovieDbContext _context;

    public MovieRepository(MovieDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        return await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .ToListAsync();
    }

    public async Task<Movie?> GetByIdAsync(int id)
    {
        return await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<Movie> CreateAsync(Movie movie)
    {
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        return movie;
    }

    public async Task<Movie> UpdateAsync(Movie movie)
    {
        _context.Movies.Update(movie);
        await _context.SaveChangesAsync();
        return movie;
    }

    public async Task DeleteAsync(Movie movie)
    {
        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Movies.AnyAsync(m => m.Id == id);
    }
    public async Task<IEnumerable<Movie>> GetTopRatedAsync(int count)
    {
        return await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .Where(m => m.ReviewCount > 0)
            .OrderByDescending(m => m.AverageRating)
            .ThenByDescending(m => m.ReviewCount)
            .Take(count)
            .ToListAsync();
    }
    public async Task<IEnumerable<Movie>> SearchAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm)) return new List<Movie>();

        return await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .Where(m => m.Title.Contains(searchTerm))
            .ToListAsync();
    }
}