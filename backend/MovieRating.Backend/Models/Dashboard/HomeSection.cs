using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Generic;

namespace MovieRating.Backend.Models.Dashboard;

public class HomeSection
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public required string Title { get; set; }
    
    public int? GenreId { get; set; }
    public Genre? Genre { get; set; }
    
    public int? MinYear { get; set; }
    
    public decimal? MinRating { get; set; }

    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }

    public ICollection<HomeSectionMovie> Movies { get; set; } = new List<HomeSectionMovie>();
    public ICollection<HomeSectionShow> Shows { get; set; } = new List<HomeSectionShow>();
}