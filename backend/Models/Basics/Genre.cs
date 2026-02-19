using System.ComponentModel.DataAnnotations;

namespace MovieRating.Backend.Models.Basics;

public class Genre
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public required string Name { get; set; }
    
    public ICollection<MovieGenre> MovieGenres { get; set; } =  new List<MovieGenre>();
}