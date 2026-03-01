using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;

namespace MovieRating.Backend.Models.Generic;

public class Genre
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public required string Name { get; set; }
    
    public required bool isActive { get; set; } = false;
    
    public ICollection<MovieGenre> MovieGenres { get; set; } =  new List<MovieGenre>();
    public ICollection<ShowGenre> ShowGenres { get; set; } = new List<ShowGenre>();
}