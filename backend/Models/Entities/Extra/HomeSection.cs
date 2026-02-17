using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Entities;

public class HomeSection
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public required string Title { get; set; }
    
    public SectionType Type { get; set; }
    
    public int? GenreId { get; set; }
    public Genre? Genre { get; set; }
    
    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }

    public ICollection<HomeSectionMovie> Movies { get; set; } = new List<HomeSectionMovie>();
}