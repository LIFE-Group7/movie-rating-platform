using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Genre;
using MovieRating.Backend.Models.Generic;
using MovieRating.Backend.Repositories.Interfaces;
using MovieRating.Backend.Services.Interfaces;

namespace MovieRating.Backend.Services;

public class GenreService : IGenreService
{
    private readonly IGenreRepository _genreRepository;

    public GenreService(IGenreRepository genreRepository)
    {
        _genreRepository = genreRepository;
    }

    public async Task<Result<IEnumerable<GenreDto>>> GetAllAsync()
    {
        var genres = await _genreRepository.GetAllAsync();

        return Result<IEnumerable<GenreDto>>.Success(
            genres.Select(MapToDto)
        );
    }

    public async Task<Result<IEnumerable<GenreDto>>> GetActiveAsync()
    {
        var genres = await _genreRepository.GetActiveAsync();

        return Result<IEnumerable<GenreDto>>.Success(
            genres.Select(MapToDto)
        );
    }

    public async Task<Result<GenreDto>> GetByIdAsync(int id)
    {
        var genre = await _genreRepository.GetByIdAsync(id);

        if (genre is null)
            return Result<GenreDto>.Failure("Genre not found", ErrorType.NotFound);

        return Result<GenreDto>.Success(MapToDto(genre));
    }

    public async Task<Result<GenreDto>> CreateAsync(CreateGenreDto genreDto)
    {
        var trimmedName = genreDto.Name.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
            return Result<GenreDto>.Failure("Genre name cannot be empty.", ErrorType.Validation);

        if (await _genreRepository.ExistsByNameAsync(trimmedName))
            return Result<GenreDto>.Failure($"Genre '{trimmedName}' already exists.", ErrorType.Conflict);

        var genre = new Genre { Name = trimmedName, isActive = false };
        var createdGenre = await _genreRepository.CreateAsync(genre);

        return Result<GenreDto>.Success(MapToDto(createdGenre));
    }

    public async Task<Result<GenreDto>> UpdateAsync(int id, UpdateGenreDto genreDto)
    {
        var genre = await _genreRepository.GetByIdAsync(id);
        if (genre is null)
            return Result<GenreDto>.Failure("Genre not found", ErrorType.NotFound);

        if (!genre.Name.Equals(genreDto.Name.Trim(), StringComparison.OrdinalIgnoreCase)
           && await _genreRepository.ExistsByNameAsync(genreDto.Name))
            return Result<GenreDto>.Failure($"Genre '{genreDto.Name}' already exists.", ErrorType.Conflict);

        genre.Name = genreDto.Name.Trim();
        genre.isActive = genreDto.isActive;
        await _genreRepository.UpdateAsync(genre);

        return Result<GenreDto>.Success(MapToDto(genre));
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var genre = await _genreRepository.GetByIdAsync(id);
        if (genre is null)
            return Result.Failure("Genre not found", ErrorType.NotFound);

        await _genreRepository.DeleteAsync(genre);

        return Result.Success();
    }

    private static GenreDto MapToDto(Genre genre)
    {
        return new GenreDto()
        {
            Id = genre.Id,
            Name = genre.Name,
            isActive = genre.isActive
        };
    }
}