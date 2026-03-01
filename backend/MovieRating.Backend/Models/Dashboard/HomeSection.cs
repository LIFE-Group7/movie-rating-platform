using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Generic;

namespace MovieRating.Backend.Models.Dashboard;

public class HomeSection
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public required string Title { get; set; }
    
    public bool IsHidden { get; set; } = true;
    
    public bool IncludeMovies { get; set; } = true;
    public bool IncludeShows { get; set; } = true;
    
    [Range(1, 100)]
    public int MediaLimit { get; set; } = 10;
    
    public HomeSectionSortBy SortBy { get; set; } = HomeSectionSortBy.Year;
    public DateTime CreatedAt { get; set; }

    public ICollection<HomeSectionMovie> Movies { get; set; } = new List<HomeSectionMovie>();
    public ICollection<HomeSectionShow> Shows { get; set; } = new List<HomeSectionShow>();
}