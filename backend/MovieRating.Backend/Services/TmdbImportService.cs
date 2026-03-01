using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Common;
using MovieRating.Backend.Data;
using MovieRating.Backend.DTOs.Import;
using MovieRating.Backend.Models.Generic;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class TmdbImportService : ITmdbImportService
{
    private readonly MovieDbContext _db;
    private readonly HttpClient _http;
    private readonly string _imageBase;
    private readonly string _baseUrl;
    
    private static readonly Dictionary<string, string> GenreNameMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Science Fiction"] = "Sci-Fi",
        ["Sci-Fi & Fantasy"] = "Sci-Fi",
        ["Action & Adventure"] = "Action",
        ["War & Politics"] = "War",
    };
    
    public TmdbImportService(MovieDbContext db, IHttpClientFactory httpFactory, IConfiguration config)
    {
        _db = db;
        _http = httpFactory.CreateClient("tmdb");
        _imageBase = config["Tmdb:ImageBaseUrl"] ?? "https://image.tmdb.org/t/p/w500";
        _baseUrl = (config["Tmdb:BaseUrl"] ?? "https://api.themoviedb.org/3").TrimEnd('/');
    }
    
    public async Task<Result<TmdbImportResult>> ImportAllAsync(int moviePages = 3, int showPages = 2)
    {
        // ── 1. Sync genres from TMDB ─────────────────────────────────────────
        var genresCreated = await SyncGenresAsync();

        // Build a lookup: TMDB genre ID → local Genre entity ID
        var tmdbGenreMap = await BuildTmdbGenreMapAsync();

        // ── 2. Import movies ─────────────────────────────────────────────────
        var moviesImported = 0;
        for (var page = 1; page <= moviePages; page++)
        {
            var items = await FetchPageAsync<TmdbMovie>("movie/popular", page);
            foreach (var item in items)
            {
                var existingMovie = await _db.Movies.FirstOrDefaultAsync(m => m.Title == item.Title);
                if (existingMovie is not null)
                {
                    if (existingMovie.BackdropImageUrl is null && item.BackdropPath is not null)
                    {
                        existingMovie.BackdropImageUrl = BuildBackdropUrl(item.BackdropPath);
                        await _db.SaveChangesAsync();
                    }
                    continue;
                }

                var details = await FetchMovieDetailsAsync(item.Id);
                var directorName = details?.Credits?.Crew?.FirstOrDefault(c => c.Job == "Director")?.Name;

                var movie = new Movie
                {
                    Title = item.Title,
                    Description = item.Overview,
                    ReleaseDate = ParseDate(item.ReleaseDate),
                    DurationMinutes = details?.Runtime ?? 0, // Now mapped dynamically!
                    Director = directorName,                 // Now mapped dynamically!
                    CoverImageUrl = item.PosterPath != null ? $"{_imageBase}{item.PosterPath}" : null,
                    BackdropImageUrl = item.BackdropPath != null ? BuildBackdropUrl(item.BackdropPath) : null,
                    AddedAt = DateTime.UtcNow,
                };

                _db.Movies.Add(movie);
                await _db.SaveChangesAsync();

                foreach (var tmdbGenreId in item.GenreIds)
                {
                    if (tmdbGenreMap.TryGetValue(tmdbGenreId, out var localGenreId))
                        _db.MovieGenres.Add(new MovieGenre { MovieId = movie.Id, GenreId = localGenreId });
                }
                await _db.SaveChangesAsync();
                moviesImported++;
            }
        }

        // ── 3. Import shows ──────────────────────────────────────────────────
        var showsImported = 0;
        for (var page = 1; page <= showPages; page++)
        {
            var items = await FetchPageAsync<TmdbShow>("tv/popular", page);
            foreach (var item in items)
            {
                var existingShow = await _db.Shows.FirstOrDefaultAsync(s => s.Title == item.Name);
                if (existingShow is not null)
                {
                    if (existingShow.BackdropImageUrl is null && item.BackdropPath is not null)
                    {
                        existingShow.BackdropImageUrl = BuildBackdropUrl(item.BackdropPath);
                        await _db.SaveChangesAsync();
                    }
                    continue;
                }

                // Fetch full details to get seasons/episodes counts
                var details = await FetchShowDetailsAsync(item.Id);
                var creatorName = details?.CreatedBy?.FirstOrDefault()?.Name;

                var show = new Show
                {
                    Title = item.Name,
                    Description = item.Overview,
                    FirstAirDate = ParseDate(item.FirstAirDate),
                    CoverImageUrl = item.PosterPath != null ? $"{_imageBase}{item.PosterPath}" : null,
                    BackdropImageUrl = item.BackdropPath != null ? BuildBackdropUrl(item.BackdropPath) : null,
                    Seasons = details?.NumberOfSeasons ?? 1,
                    Episodes = details?.NumberOfEpisodes ?? 0,
                    Status = details?.Status == "Ended" ? ShowStatus.Ended : ShowStatus.Ongoing,
                    Director = creatorName, // Now mapped dynamically!
                    AddedAt = DateTime.UtcNow,
                };

                _db.Shows.Add(show);
                await _db.SaveChangesAsync();

                foreach (var tmdbGenreId in item.GenreIds)
                {
                    if (tmdbGenreMap.TryGetValue(tmdbGenreId, out var localGenreId))
                        _db.ShowGenres.Add(new ShowGenre { ShowId = show.Id, GenreId = localGenreId });
                }
                await _db.SaveChangesAsync();
                showsImported++;
            }
        }

        return Result<TmdbImportResult>.Success(new TmdbImportResult(moviesImported, showsImported, genresCreated));
    }
    
    private async Task<int> SyncGenresAsync()
    {
        var created = 0;

        var movieGenres = await FetchGenreListAsync("genre/movie/list");
        var tvGenres = await FetchGenreListAsync("genre/tv/list");
        var allTmdbGenres = movieGenres.Concat(tvGenres)
            .GroupBy(g => NormaliseName(g.Name))
            .Select(g => g.First())
            .ToList();

        foreach (var g in allTmdbGenres)
        {
            var localName = NormaliseName(g.Name);
            if (!await _db.Genres.AnyAsync(x => x.Name == localName))
            {
                _db.Genres.Add(new Genre { Name = localName , isActive = false});
                created++;
            }
        }
        await _db.SaveChangesAsync();
        return created;
    }

    private async Task<Dictionary<int, int>> BuildTmdbGenreMapAsync()
    {
        // Fetch TMDB genre lists and map each TMDB ID → local Genre.Id
        var movieGenres = await FetchGenreListAsync("/genre/movie/list");
        var tvGenres = await FetchGenreListAsync("/genre/tv/list");
        var allTmdb = movieGenres.Concat(tvGenres)
            .GroupBy(g => g.Id)
            .Select(g => g.First())
            .ToList();

        var localGenres = await _db.Genres.ToListAsync();
        var result = new Dictionary<int, int>();
        foreach (var t in allTmdb)
        {
            var localName = NormaliseName(t.Name);
            var local = localGenres.FirstOrDefault(g =>
                string.Equals(g.Name, localName, StringComparison.OrdinalIgnoreCase));
            if (local != null) result[t.Id] = local.Id;
        }
        return result;
    }

    private async Task<List<TmdbGenre>> FetchGenreListAsync(string path)
    {
        var json = await _http.GetStringAsync($"{_baseUrl}/{path.TrimStart('/')}");
        var doc = JsonDocument.Parse(json);
        return doc.RootElement
            .GetProperty("genres")
            .Deserialize<List<TmdbGenre>>(JsonOptions) ?? [];
    }

    private async Task<List<T>> FetchPageAsync<T>(string path, int page)
    {
        var json = await _http.GetStringAsync($"{_baseUrl}/{path.TrimStart('/')}?page={page}");
        var doc = JsonDocument.Parse(json);
        return doc.RootElement
            .GetProperty("results")
            .Deserialize<List<T>>(JsonOptions) ?? [];
    }

    private async Task<TmdbShowDetails?> FetchShowDetailsAsync(int tmdbId)
    {
        try
        {
            var json = await _http.GetStringAsync($"{_baseUrl}/tv/{tmdbId}");
            return JsonSerializer.Deserialize<TmdbShowDetails>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    private static string NormaliseName(string tmdbName) =>
        GenreNameMap.TryGetValue(tmdbName, out var mapped) ? mapped : tmdbName;

    private string BuildBackdropUrl(string backdropPath) =>
        $"{_imageBase.Replace("/w500", "/w1280")}{backdropPath}";

    private static DateOnly ParseDate(string? s) =>
        DateOnly.TryParse(s, out var d) ? d : DateOnly.FromDateTime(DateTime.UtcNow);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,  // ← handles genre_ids, release_date, etc.
    };

    private async Task<TmdbMovieDetails?> FetchMovieDetailsAsync(int tmdbId)
    {
        try
        {
            // append_to_response=credits brings in the cast & crew in the same call
            var json = await _http.GetStringAsync($"{_baseUrl}/movie/{tmdbId}?append_to_response=credits");
            return JsonSerializer.Deserialize<TmdbMovieDetails>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

}