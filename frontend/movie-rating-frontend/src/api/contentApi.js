import { get } from "./apiClient";
import { buildPlaceholderPoster } from "../utils/media";

// Handles both array responses and paginated wrappers { data: [], items: [], results: [] }
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.results && Array.isArray(payload.results))
    return payload.results;
  return [];
};

const coerceGenres = (input) => {
  if (Array.isArray(input)) return input;
  if (typeof input === "string" && input.trim()) return [input];
  return [];
};

// Extract year from date string (YYYY-MM-DD or DateOnly)
const extractYear = (dateString) => {
  if (!dateString) return null;
  const year = String(dateString).split("-")[0];
  return year && !isNaN(year) ? parseInt(year, 10) : null;
};

// Format duration from minutes to human-readable string
const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return null;
  return `${minutes} min`;
};

// Normalizes a raw Movie DTO from the backend into the shape the UI expects
const normalizeMovie = (item, idx = 0) => {
  const title = item.title ?? item.name ?? `Untitled ${idx + 1}`;
  const backdropUrl =
    item.backdropUrl ??
    item.backdropImageUrl ??
    item.BackdropImageUrl ??
    item.backdropPath ??
    (item.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
      : undefined);
  const imageUrl =
    item.imageUrl ??
    item.coverImageUrl ??
    item.CoverImageUrl ??
    item.posterUrl ??
    (item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : buildPlaceholderPoster(title));
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
    backdropUrl,
    imageUrl,
    description: item.description ?? item.overview ?? "",
    year: extractYear(
      item.releaseDate ?? item.ReleaseDate ?? item.release_date,
    ),
    director: item.director ?? item.Director ?? null,
    duration: formatDuration(
      item.durationMinutes ?? item.DurationMinutes ?? item.runtime,
    ),
  };
};

// Normalizes a raw Show DTO from the backend into the shape the UI expects
const normalizeShow = (item, idx = 0) => {
  const title = item.title ?? item.name ?? `Untitled ${idx + 1}`;
  const backdropUrl =
    item.backdropUrl ??
    item.backdropImageUrl ??
    item.BackdropImageUrl ??
    item.backdropPath ??
    (item.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
      : undefined);
  const imageUrl =
    item.imageUrl ??
    item.coverImageUrl ??
    item.CoverImageUrl ??
    item.posterUrl ??
    buildPlaceholderPoster(title);
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
    backdropUrl,
    imageUrl,
    description: item.description ?? item.overview ?? "",
    year: extractYear(
      item.firstAirDate ?? item.FirstAirDate ?? item.first_air_date,
    ),
    director: item.director ?? item.Director ?? item.creator ?? null,
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
