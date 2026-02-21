using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Models.Basics;

namespace MovieRating.Backend.DTOs.Show;

public class CreateShowDto
{
    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateOnly FirstAirDate { get; set; }

    public DateOnly? LastAirDate { get; set; }

    [MaxLength(150)]
    public string? Creator { get; set; }

    public string? CoverImageUrl { get; set; }

    public int Seasons { get; set; }

    public int Episodes { get; set; }

    public ShowStatus Status { get; set; } = ShowStatus.Ongoing;

    public List<int> GenreIds { get; set; } = new();
}
