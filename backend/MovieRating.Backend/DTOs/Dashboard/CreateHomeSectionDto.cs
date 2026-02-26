using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs.Dashboard;

public class CreateHomeSectionDto
{
    [Required]
    [MaxLength(100)]
    public required string Title { get; set; }
    
    public int? MinYear { get; set; }
    public decimal? MinRating { get; set; }
    public bool IsActive { get; set; } = true;
}