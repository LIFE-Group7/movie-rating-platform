using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.DTOs.Genre;

public class UpdateGenreDto
{
    [MaxLength(50)]
    public string Name { get; set; }
    public bool isActive { get; set; }
}