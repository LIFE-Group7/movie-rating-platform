using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Dashboard;

namespace MovieRating.Backend.DTOs.Dashboard;

public class UpdateHomeSectionDto
{
    [Required]
    [MaxLength(100)]
    public required string? Title { get; set; }
    
    public bool? IsHidden { get; set; }
    
    public bool? IncludeMovies { get; set; }
    public bool? IncludeShows { get; set; }
    
    [Range(1, 100)]
    public int? MediaLimit { get; set; }
    
    public HomeSectionSortBy? SortBy { get; set; } = HomeSectionSortBy.Year;
}