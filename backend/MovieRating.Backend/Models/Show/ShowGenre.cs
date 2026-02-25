using MovieRating.Backend.Models.Generic;

namespace MovieRating.Backend.Models.Show;

public class ShowGenre
{
    public int ShowId { get; set; }
    public Show Show { get; set; } = null!;

    public int GenreId { get; set; }
    public Genre Genre { get; set; } = null!;
}
