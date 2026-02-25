using MovieRating.Backend.Common;
using MovieRating.Backend.DTOs.Show;

namespace MovieRating.Backend.Services.Interfaces;

public interface IShowService
{
    Task<Result<IEnumerable<ShowDto>>> GetAllAsync();
    Task<Result<ShowDto>> GetByIdAsync(int id);
    Task<Result<IEnumerable<ShowDto>>> GetTopRatedAsync(int count);
    Task<Result<ShowDto>> CreateAsync(CreateShowDto showDto);
    Task<Result<ShowDto>> UpdateAsync(int id, UpdateShowDto showDto);
    Task<Result> DeleteAsync(int id);
}
