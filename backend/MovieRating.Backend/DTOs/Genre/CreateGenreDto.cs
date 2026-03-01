using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs.Genre;

public class CreateGenreDto
{
    [Required]
    [MaxLength(50)]
    public required string Name { get; set; }
}