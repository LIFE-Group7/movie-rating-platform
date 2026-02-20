// Mock data serves as placeholder until backend API is ready
// Each show supports multiple genres for comprehensive categorization
const placeholderPoster = (title) =>
  `https://placehold.co/400x600?text=${encodeURIComponent(title).replace(/%20/g, "+")}`;

const omdbApiKey = import.meta.env.VITE_OMDB_API_KEY;

const getPosterUrl = (title, year) => {
  if (!omdbApiKey) {
    return placeholderPoster(title);
  }

  return `https://img.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}`;
};

export const shows = [
  {
    id: 101,
    type: "show",
    title: "Breaking Bad",
    rating: 9.5,
    year: 2008,
    releaseDate: "2008-01-20",
    imageUrl: getPosterUrl("Breaking Bad", 2008),
    genre: "Crime",
    genres: ["Crime", "Drama", "Thriller"],
    creator: "Vince Gilligan",
    mainStars: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    description:
      "A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family's financial future.",
    seasons: 5,
    episodes: 62,
    status: "Ended",
  },
  {
    id: 102,
    type: "show",
    title: "Game of Thrones",
    rating: 9.2,
    year: 2011,
    releaseDate: "2011-04-17",
    imageUrl: getPosterUrl("Game of Thrones", 2011),
    genre: "Drama",
    genres: ["Drama", "Fantasy", "Adventure"],
    creator: "David Benioff & D.B. Weiss",
    mainStars: ["Emilia Clarke", "Kit Harington", "Peter Dinklage"],
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    seasons: 8,
    episodes: 73,
    status: "Ended",
  },
  {
    id: 103,
    type: "show",
    title: "Stranger Things",
    rating: 8.7,
    year: 2016,
    releaseDate: "2016-07-15",
    imageUrl: getPosterUrl("Stranger Things", 2016),
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Drama", "Horror"],
    creator: "The Duffer Brothers",
    mainStars: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
    description:
      "When a young boy disappears, his mother and friends must confront terrifying supernatural forces in order to get him back.",
    seasons: 5,
    episodes: 42,
    status: "Ongoing",
  },
  {
    id: 104,
    type: "show",
    title: "The Sopranos",
    rating: 9.2,
    year: 1999,
    releaseDate: "1999-01-10",
    imageUrl: getPosterUrl("The Sopranos", 1999),
    genre: "Crime",
    genres: ["Crime", "Drama"],
    creator: "David Chase",
    mainStars: ["James Gandolfini", "Lorraine Bracco", "Edie Falco"],
    description:
      "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state.",
    seasons: 6,
    episodes: 86,
    status: "Ended",
  },
  {
    id: 105,
    type: "show",
    title: "The Last of Us",
    rating: 8.8,
    year: 2023,
    releaseDate: "2023-01-15",
    imageUrl: getPosterUrl("The Last of Us", 2023),
    genre: "Drama",
    genres: ["Drama", "Action", "Horror"],
    creator: "Craig Mazin & Neil Druckmann",
    mainStars: ["Pedro Pascal", "Bella Ramsey", "Gabriel Luna"],
    description:
      "Joel and Ellie, a pair connected through the harshness of the world they live in, must traverse a post-apocalyptic United States to find a possible cure.",
    seasons: 2,
    episodes: 17,
    status: "Ongoing",
  },
  {
    id: 106,
    type: "show",
    title: "True Detective",
    rating: 8.9,
    year: 2014,
    releaseDate: "2014-01-12",
    imageUrl: getPosterUrl("True Detective", 2014),
    genre: "Crime",
    genres: ["Crime", "Drama", "Thriller"],
    creator: "Nic Pizzolatto",
    mainStars: ["Matthew McConaughey", "Woody Harrelson", "Jodie Foster"],
    description:
      "Anthology series in which police investigations unearth the personal and professional secrets of those involved, both combatants and victims of crime.",
    seasons: 4,
    episodes: 30,
    status: "Ended",
  },
  {
    id: 107,
    type: "show",
    title: "The Mandalorian",
    rating: 8.7,
    year: 2019,
    releaseDate: "2019-11-12",
    imageUrl: getPosterUrl("The Mandalorian", 2019),
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Adventure"],
    creator: "Jon Favreau",
    mainStars: ["Pedro Pascal", "Katee Sackhoff", "Carl Weathers"],
    description:
      "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    seasons: 3,
    episodes: 24,
    status: "Ongoing",
  },
  {
    id: 108,
    type: "show",
    title: "Chernobyl",
    rating: 9.4,
    year: 2019,
    releaseDate: "2019-05-06",
    imageUrl: getPosterUrl("Chernobyl", 2019),
    genre: "Drama",
    genres: ["Drama", "History"],
    creator: "Craig Mazin",
    mainStars: ["Jared Harris", "Stellan Skarsgard", "Emily Watson"],
    description:
      "In April 1986, the city of Chernobyl in the Soviet Union suffers one of the worst nuclear disasters in history and the brave men and women who made sacrifices to save Europe from unimaginable catastrophe.",
    seasons: 1,
    episodes: 5,
    status: "Ended",
  },
];

// Extracts all unique genres from the shows collection
export const getAllShowGenres = () => {
  const genreSet = new Set();
  shows.forEach((show) => {
    (show.genres || []).forEach((genre) => genreSet.add(genre));
  });
  return Array.from(genreSet).sort();
};
