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
        var sections = await _context.HomeSections
            .OrderByDescending(hs => hs.CreatedAt)
            .ToListAsync();

        foreach (var section in sections)
            await LoadSectionMediaAsync(section);

        return sections;
    }

    public async Task<HomeSection?> GetByIdAsync(int id)
    {
        var section = await _context.HomeSections
            .FirstOrDefaultAsync(hs => hs.Id == id);

        if (section is not null)
            await LoadSectionMediaAsync(section);

        return section;
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

    public async Task<IEnumerable<HomeSection>> GetActiveSectionsWithMediaAsync()
    {
        var sections = await _context.HomeSections
            .Where(hs => !hs.IsHidden)
            .OrderByDescending(hs => hs.CreatedAt)
            .ToListAsync();

        foreach (var section in sections)
        {
            await LoadSectionMediaAsync(section);
        }
        
        return sections;
    }

    private async Task LoadSectionMediaAsync(HomeSection section)
    {
        if (section.IncludeMovies)
        {
            var moviesQuery = _context.Movies.AsQueryable();

            moviesQuery = section.SortBy == HomeSectionSortBy.Rating
                ? moviesQuery.OrderByDescending(m => m.AverageRating).ThenByDescending(m => m.ReleaseDate)
                : moviesQuery.OrderByDescending(m => m.ReleaseDate).ThenByDescending(m => m.AverageRating);

            var movies = await moviesQuery.Take(section.MediaLimit).ToListAsync();

            section.Movies = movies.Select(m => new HomeSectionMovie
            {
                HomeSectionId = section.Id,
                HomeSection = section,
                MovieId = m.Id,
                Movie = m
            }).ToList();
        }

        if (section.IncludeShows)
        {
            var showsQuery = _context.Shows.AsQueryable();

            showsQuery = section.SortBy == HomeSectionSortBy.Rating
                ? showsQuery.OrderByDescending(s => s.AverageRating).ThenByDescending(s => s.FirstAirDate)
                : showsQuery.OrderByDescending(s => s.FirstAirDate).ThenByDescending(s => s.AverageRating);

            var shows = await showsQuery.Take(section.MediaLimit).ToListAsync();

            section.Shows = shows.Select(s => new HomeSectionShow
            {
                HomeSectionId = section.Id,
                HomeSection = section,
                ShowId = s.Id,
                Show = s
            }).ToList();
        }
    }
}