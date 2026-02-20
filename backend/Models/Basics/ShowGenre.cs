namespace MovieRating.Backend.Models.Basics;

public class ShowGenre
{
    public int ShowId { get; set; }
    public Show Show { get; set; } = null!;

    public int GenreId { get; set; }
    public Genre Genre { get; set; } = null!;
}
