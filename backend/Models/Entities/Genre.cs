using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Entities;

public class Genre
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public required string Name { get; set; }
}