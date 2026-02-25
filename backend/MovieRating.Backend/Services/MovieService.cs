using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _movieRepository;
    private readonly ILogger<MovieService> _logger;

    public MovieService(IMovieRepository movieRepository, ILogger<MovieService> logger)
    {
        _movieRepository = movieRepository;
        _logger = logger;
    }
    
    public async Task<Result<IEnumerable<MovieDto>>> GetAllAsync()
    {
        var movies = await _movieRepository.GetAllAsync();
        
        return Result<IEnumerable<MovieDto>>.Success(movies.Select(MapToDto));
    }

    public async Task<Result<MovieDto>> GetByIdAsync(int id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        if (movie is null) {
            return Result<MovieDto>.Failure("Movie not found", ErrorType.NotFound);
        }
        
        return Result<MovieDto>.Success(MapToDto(movie));
    }

    public async Task<Result<MovieDto>> CreateAsync(CreateMovieDto movieDto)
    {
        var movie = new Movie()
        {
            Title = movieDto.Title,
            Description = movieDto.Description,
            ReleaseDate = movieDto.ReleaseDate,
            Director = movieDto.Director,
            DurationMinutes = movieDto.DurationMinutes,
            CoverImageUrl = movieDto.CoverImageUrl,
            AddedAt = DateTime.UtcNow,
            MovieGenres = movieDto.GenreIds.Select(id => new MovieGenre()
            {
                GenreId = id
            }).ToList()
        };
        
        var created = await _movieRepository.CreateAsync(movie);
        var completeMovie = await _movieRepository.GetByIdAsync(created.Id);

        return Result<MovieDto>.Success(MapToDto(completeMovie!));
    }

    public async Task<Result<MovieDto>> UpdateAsync(int id, UpdateMovieDto movieDto)
    {
        var movie =  await _movieRepository.GetByIdAsync(id);
        if (movie is null) 
            return Result<MovieDto>.Failure("Movie not found", ErrorType.NotFound);
        
        if (movieDto.Title is not null) movie.Title = movieDto.Title;
        if (movieDto.Description is not null) movie.Description = movieDto.Description;
        if (movieDto.ReleaseDate is not null) movie.ReleaseDate = movieDto.ReleaseDate.Value;
        if (movieDto.Director is not null) movie.Director = movieDto.Director;
        if (movieDto.DurationMinutes is not null) movie.DurationMinutes = movieDto.DurationMinutes.Value;
        if(movieDto.CoverImageUrl is not null)  movie.CoverImageUrl = movieDto.CoverImageUrl;

        if (movieDto.GenreIds is not null)
        {
            movie.MovieGenres.Clear();
            foreach (var genreId in movieDto.GenreIds)
            {
                movie.MovieGenres.Add(new MovieGenre
                {
                    MovieId = movie.Id,
                    GenreId = genreId
                });
            }
        }
        
        var updated = await _movieRepository.UpdateAsync(movie);

        var completeMovie = await _movieRepository.GetByIdAsync(updated.Id);

        return Result<MovieDto>.Success(MapToDto(completeMovie!));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        if (movie is null) 
            return Result.Failure("Movie not found", ErrorType.NotFound);

        await _movieRepository.DeleteAsync(movie);
        return Result.Success();
    }

    public async Task<Result<IEnumerable<MovieDto>>> GetTopRatedMoviesAsync(int count)
    {
        try
        {
            var movies = await _movieRepository.GetTopRatedAsync(count);

            return Result<IEnumerable<MovieDto>>.Success(movies.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve the top {Count} rated movies.", count);
            return Result<IEnumerable<MovieDto>>.Failure("An unexpected error occurred while fetching top rated movies.", ErrorType.Failure);
        }
    }

    private static MovieDto MapToDto(Movie movie)
    {
        var movieDto = new MovieDto()
        {
            Id = movie.Id,
            Title = movie.Title,
            Description = movie.Description,
            ReleaseDate = movie.ReleaseDate,
            Director = movie.Director,
            DurationMinutes = movie.DurationMinutes,
            CoverImageUrl = movie.CoverImageUrl,
            AddedAt = movie.AddedAt,
            AverageRating = movie.AverageRating,
            ReviewCount = movie.ReviewCount,
            Genres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList()
        };
        
        return movieDto;
    }
}