using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Movie;
using MovieRating.Backend.Models.Entities.Basics;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _movieRepository;

    public MovieService(IMovieRepository movieRepository)
    {
        _movieRepository = movieRepository;
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
        return Result<MovieDto>.Success(MapToDto(created));
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
            movie.MovieGenres = movieDto.GenreIds.Select(genreId => new MovieGenre
            {
                MovieId = movie.Id,
                GenreId = genreId
            }).ToList();
        }
        
        var updated = await _movieRepository.UpdateAsync(movie);
        return Result<MovieDto>.Success(MapToDto(updated));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        if (movie is null) 
            return Result.Failure("Movie not found", ErrorType.NotFound);

        await _movieRepository.DeleteAsync(movie);
        return Result.Success();
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