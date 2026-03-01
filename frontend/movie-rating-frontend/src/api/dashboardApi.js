import { del, get, post, put } from "./apiClient";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const coerceSortBy = (value) => {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "").toLowerCase();
  return normalized === "rating" ? 1 : 0;
};

const toFilterBy = (sortBy) => (coerceSortBy(sortBy) === 1 ? "rating" : "year");
const toSortBy = (filterBy) =>
  String(filterBy ?? "")
    .toLowerCase()
    .startsWith("rating")
    ? 1
    : 0;

const normalizeGenre = (item, idx = 0) => ({
  id: item.id ?? item.Id ?? idx,
  name: item.name ?? item.Name ?? "Untitled",
  isActive: item.isActive ?? item.IsActive ?? false,
});

const normalizeSection = (item, idx = 0) => ({
  id: item.id ?? item.Id ?? idx,
  title: item.title ?? item.Title ?? "Untitled Section",
  filterBy: toFilterBy(item.sortBy ?? item.SortBy),
  visible: !(item.isHidden ?? item.IsHidden ?? false),
});

const toSectionDto = ({ title, filterBy, visible }) => ({
  title,
  isHidden: !visible,
  includeMovies: true,
  includeShows: true,
  mediaLimit: 10,
  sortBy: toSortBy(filterBy),
});

export const fetchDashboardGenres = async () => {
  const payload = await get("/api/dashboard/genres");
  return toArray(payload).map(normalizeGenre);
};

export const createDashboardGenre = async (name) => {
  const payload = await post("/api/dashboard/genres", { name });
  return normalizeGenre(payload);
};

export const updateDashboardGenre = async (id, name, isActive) => {
  const payload = await put(`/api/dashboard/genres/${id}`, { name, isActive });
  return normalizeGenre(payload);
};

export const updateDashboardGenreActivation = async (id, name, isActive) => {
  const payload = await put(`/api/dashboard/genres/${id}`, {
    name,
    isActive,
  });
  return normalizeGenre(payload);
};

export const fetchDashboardSections = async () => {
  const payload = await get("/api/dashboard/sections");
  return toArray(payload).map(normalizeSection);
};

export const createDashboardSection = async (section) => {
  const payload = await post("/api/dashboard/sections", toSectionDto(section));
  return normalizeSection(payload);
};

export const updateDashboardSection = async (id, section) => {
  const payload = await put(
    `/api/dashboard/sections/${id}`,
    toSectionDto(section),
  );
  return normalizeSection(payload);
};

export const deleteDashboardSection = async (id) => {
  await del(`/api/dashboard/sections/${id}`);
};
