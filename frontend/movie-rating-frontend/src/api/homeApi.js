import { get } from "./apiClient";

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

const normalizeGenre = (item, idx = 0) => ({
  id: item.id ?? item.Id ?? idx,
  name: item.name ?? item.Name ?? "Untitled",
  isActive: item.isActive ?? item.IsActive ?? true,
});

const normalizeSection = (item, idx = 0) => ({
  id: item.id ?? item.Id ?? idx,
  title: item.title ?? item.Title ?? "Untitled Section",
  filterBy: toFilterBy(item.sortBy ?? item.SortBy),
  visible: !(item.isHidden ?? item.IsHidden ?? false),
});

export const fetchHomeGenres = async () => {
  const payload = await get("/api/home/genres");
  return toArray(payload).map(normalizeGenre);
};

export const fetchHomeSections = async () => {
  const payload = await get("/api/home/sections");
  return toArray(payload).map(normalizeSection);
};
