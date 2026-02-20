// Mock data serves as placeholder until backend API is ready
// Each movie supports multiple genres for comprehensive categorization
const placeholderPoster = (title) =>
  `https://placehold.co/400x600?text=${encodeURIComponent(title).replace(/%20/g, "+")}`;

const omdbApiKey = import.meta.env.VITE_OMDB_API_KEY;

const getPosterUrl = (title, year) => {
  if (!omdbApiKey) {
    return placeholderPoster(title);
  }

  return `https://img.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}`;
};

export const movies = [
  {
    id: 1,
    type: "movie",
    title: "The Shawshank Redemption",
    rating: 9.3,
    year: 1994,
    releaseDate: "1994-09-23",
    imageUrl: getPosterUrl("The Shawshank Redemption", 1994),
    genre: "Drama",
    genres: ["Drama"],
    creator: "Frank Darabont",
    mainStars: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
  },
  {
    id: 2,
    type: "movie",
    title: "The Godfather",
    rating: 9.2,
    year: 1972,
    releaseDate: "1972-03-24",
    imageUrl: getPosterUrl("The Godfather", 1972),
    genre: "Crime",
    genres: ["Crime", "Drama"],
    creator: "Francis Ford Coppola",
    mainStars: ["Marlon Brando", "Al Pacino", "James Caan"],
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
  },
  {
    id: 3,
    type: "movie",
    title: "The Dark Knight",
    rating: 9.0,
    year: 2008,
    releaseDate: "2008-07-18",
    imageUrl: getPosterUrl("The Dark Knight", 2008),
    genre: "Action",
    genres: ["Action", "Crime", "Thriller"],
    creator: "Christopher Nolan",
    mainStars: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    description:
      "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham. The Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  },
  {
    id: 4,
    type: "movie",
    title: "Inception",
    rating: 8.8,
    year: 2010,
    releaseDate: "2010-07-16",
    imageUrl: getPosterUrl("Inception", 2010),
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Thriller"],
    creator: "Christopher Nolan",
    mainStars: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
  },
  {
    id: 5,
    type: "movie",
    title: "Interstellar",
    rating: 8.7,
    year: 2014,
    releaseDate: "2014-11-07",
    imageUrl: getPosterUrl("Interstellar", 2014),
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Drama"],
    creator: "Christopher Nolan",
    mainStars: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: 6,
    type: "movie",
    title: "The Matrix",
    rating: 8.7,
    year: 1999,
    releaseDate: "1999-03-31",
    imageUrl: getPosterUrl("The Matrix", 1999),
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action"],
    creator: "The Wachowskis",
    mainStars: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    description:
      "A computer hacker learns the true nature of reality and his role in the war against its controllers.",
  },
  {
    id: 7,
    type: "movie",
    title: "Se7en",
    rating: 8.6,
    year: 1995,
    releaseDate: "1995-09-22",
    imageUrl: getPosterUrl("Se7en", 1995),
    genre: "Crime",
    genres: ["Crime", "Thriller", "Drama"],
    creator: "David Fincher",
    mainStars: ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow"],
    description:
      "Two detectives hunt a serial killer who uses the seven deadly sins as inspiration for his crimes.",
  },
  {
    id: 8,
    type: "movie",
    title: "Gladiator",
    rating: 8.5,
    year: 2000,
    releaseDate: "2000-05-05",
    imageUrl: getPosterUrl("Gladiator", 2000),
    genre: "Action",
    genres: ["Action", "Drama"],
    creator: "Ridley Scott",
    mainStars: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
    description:
      "A former Roman general sets out to exact vengeance against the corrupt emperor who murdered his family.",
  },
  {
    id: 9,
    type: "movie",
    title: "Pulp Fiction",
    rating: 8.9,
    year: 1994,
    releaseDate: "1994-10-14",
    imageUrl: getPosterUrl("Pulp Fiction", 1994),
    genre: "Crime",
    genres: ["Crime", "Drama"],
    creator: "Quentin Tarantino",
    mainStars: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    description:
      "The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence and redemption.",
  },
  {
    id: 10,
    type: "movie",
    title: "Mad Max: Fury Road",
    rating: 8.1,
    year: 2015,
    releaseDate: "2015-05-15",
    imageUrl: getPosterUrl("Mad Max: Fury Road", 2015),
    genre: "Action",
    genres: ["Action", "Thriller"],
    creator: "George Miller",
    mainStars: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
    description:
      "In a post-apocalyptic wasteland, Max teams up with Furiosa to flee a tyrant and his war boys.",
  },
  {
    id: 11,
    type: "movie",
    title: "The Prestige",
    rating: 8.5,
    year: 2006,
    releaseDate: "2006-10-20",
    imageUrl: getPosterUrl("The Prestige", 2006),
    genre: "Thriller",
    genres: ["Drama", "Thriller", "Sci-Fi"],
    creator: "Christopher Nolan",
    mainStars: ["Christian Bale", "Hugh Jackman", "Scarlett Johansson"],
    description:
      "After a tragic accident, two magicians engage in a bitter rivalry filled with obsession and deception.",
  },
  {
    id: 12,
    type: "movie",
    title: "Minority Report",
    rating: 7.6,
    year: 2002,
    releaseDate: "2002-06-21",
    imageUrl: getPosterUrl("Minority Report", 2002),
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Crime", "Thriller"],
    creator: "Steven Spielberg",
    mainStars: ["Tom Cruise", "Colin Farrell", "Samantha Morton"],
    description:
      "In a future where crime is predicted before it happens, a top officer is accused of a future murder.",
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
