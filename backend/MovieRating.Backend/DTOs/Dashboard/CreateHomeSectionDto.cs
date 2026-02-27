using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Dashboard;

namespace MovieRating.Backend.DTOs.Dashboard;

public class CreateHomeSectionDto
{
    [Required]
    [MaxLength(100)]
    public required string Title { get; set; }
    
    public bool IncludeMovies { get; set; } = true;
    public bool IncludeShows { get; set; } = true;
    
    [Range(1, 100)]
    public int MediaLimit { get; set; } = 10;
    
    public HomeSectionSortBy SortBy { get; set; } = HomeSectionSortBy.Year;
    
    public bool IsHidden { get; set; } = false;
}