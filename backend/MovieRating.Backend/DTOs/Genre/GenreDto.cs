namespace MovieRating.Backend.DTOs.Genre;

public class GenreDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required bool isActive { get; set; }
}