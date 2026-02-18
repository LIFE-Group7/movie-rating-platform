// Mock data serves as placeholder until backend API is ready
// Each movie supports multiple genres for comprehensive categorization
export const movies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    rating: 9.3,
    year: 1994,
    releaseDate: "1994-09-23",
    imageUrl: "https://placehold.co/400x600?text=Shawshank+Redemption",
    genre: "Drama",
    genres: ["Drama"],
    creator: "Frank Darabont",
    mainStars: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
  },
  {
    id: 2,
    title: "The Godfather",
    rating: 9.2,
    year: 1972,
    releaseDate: "1972-03-24",
    imageUrl: "https://placehold.co/400x600?text=The+Godfather",
    genre: "Crime",
    genres: ["Crime", "Drama"],
    creator: "Francis Ford Coppola",
    mainStars: ["Marlon Brando", "Al Pacino", "James Caan"],
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
  },
  {
    id: 3,
    title: "The Dark Knight",
    rating: 9.0,
    year: 2008,
    releaseDate: "2008-07-18",
    imageUrl: "https://placehold.co/400x600?text=The+Dark+Knight",
    genre: "Action",
    genres: ["Action", "Crime", "Thriller"],
    creator: "Christopher Nolan",
    mainStars: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    description:
      "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham. The Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  },
  {
    id: 4,
    title: "Inception",
    rating: 8.8,
    year: 2010,
    releaseDate: "2010-07-16",
    imageUrl: "https://placehold.co/400x600?text=Inception",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Thriller"],
    creator: "Christopher Nolan",
    mainStars: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
  },
];

// Extracts all unique genres from the movies collection
export const getAllGenres = () => {
  const genreSet = new Set();
  movies.forEach((movie) => {
    (movie.genres || []).forEach((genre) => genreSet.add(genre));
  });
  return Array.from(genreSet).sort();
};
