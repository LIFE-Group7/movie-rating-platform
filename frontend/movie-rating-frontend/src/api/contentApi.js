import { get } from "./apiClient";

// Handles both array responses and paginated wrappers { data: [], items: [], results: [] }
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.results && Array.isArray(payload.results))
    return payload.results;
  return [];
};

const placeholder = (title) =>
  `https://placehold.co/400x600?text=${encodeURIComponent(title || "Title").replace(/%20/g, "+")}`;

const coerceGenres = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string" && input.trim()) return [input];
  return [];
};

// Normalizes a raw Movie DTO from the backend into the shape the UI expects
const normalizeMovie = (item, idx = 0) => {
  const title = item.title ?? item.name ?? `Untitled ${idx + 1}`;
  const imageUrl =
    item.imageUrl ??
    item.posterUrl ??
    (item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : placeholder(title));
  return {
    ...item,
    id: item.id ?? item.movieId ?? `${title}-${idx}`,
    type: "movie",
    title,
    rating:
      typeof item.rating === "number"
        ? item.rating
        : Number(item.averageRating ?? item.vote_average ?? 0),
    genres: coerceGenres(item.genres ?? item.genre),
    imageUrl,
    description: item.description ?? item.overview ?? "",
  };
};

// Normalizes a raw Show DTO from the backend into the shape the UI expects
const normalizeShow = (item, idx = 0) => {
  const title = item.title ?? item.name ?? `Untitled ${idx + 1}`;
  const imageUrl = item.imageUrl ?? item.posterUrl ?? placeholder(title);
  return {
    ...item,
    id: item.id ?? item.showId ?? `${title}-${idx}`,
    type: "show",
    title,
    rating:
      typeof item.rating === "number"
        ? item.rating
        : Number(item.averageRating ?? item.vote_average ?? 0),
    genres: coerceGenres(item.genres ?? item.genre),
    imageUrl,
    description: item.description ?? item.overview ?? "",
  };
};

export const fetchMovies = async () => {
  const payload = await get("/api/movie");
  return extractList(payload).map(normalizeMovie);
};

export const fetchMovieById = async (id) => {
  const item = await get(`/api/movie/${id}`);
  return normalizeMovie(item);
};

export const fetchTopRatedMovies = async () => {
  const payload = await get("/api/movie/top-rated");
  return extractList(payload).map(normalizeMovie);
};

export const fetchShows = async () => {
  const payload = await get("/api/show");
  return extractList(payload).map(normalizeShow);
};

export const fetchShowById = async (id) => {
  const item = await get(`/api/show/${id}`);
  return normalizeShow(item);
};

export const fetchTopRatedShows = async () => {
  const payload = await get("/api/show/top-rated");
  return extractList(payload).map(normalizeShow);
};
