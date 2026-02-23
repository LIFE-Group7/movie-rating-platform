import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "adminData";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin must be used within an AdminProvider");
  return context;
};

const readFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/** Seed genres pulled from the existing mock data genre set. */
const SEED_CATEGORIES = [
  { id: 1, name: "Action" },
  { id: 2, name: "Comedy" },
  { id: 3, name: "Drama" },
  { id: 4, name: "Horror" },
  { id: 5, name: "Sci-Fi" },
  { id: 6, name: "Thriller" },
];

/** Seed homepage sections. filterBy maps to the content-fetch strategy. */
const SEED_SECTIONS = [
  { id: 1, title: "Top Rated", filterBy: "rating", visible: true },
  { id: 2, title: "New Releases", filterBy: "year", visible: true },
  { id: 3, title: "Action Hits", filterBy: "genre:Action", visible: false },
];

export function AdminProvider({ children }) {
  const [categories, setCategories] = useState(() =>
    readFromStorage(`${STORAGE_KEY}:categories`, SEED_CATEGORIES),
  );
  const [sections, setSections] = useState(() =>
    readFromStorage(`${STORAGE_KEY}:sections`, SEED_SECTIONS),
  );

  const persistCategories = useCallback((updated) => {
    localStorage.setItem(`${STORAGE_KEY}:categories`, JSON.stringify(updated));
  }, []);

  const persistSections = useCallback((updated) => {
    localStorage.setItem(`${STORAGE_KEY}:sections`, JSON.stringify(updated));
  }, []);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  /** Adds a new category. Returns false if name is blank or already exists. */
  const addCategory = useCallback(
    (name) => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      const isDuplicate = categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (isDuplicate) return false;

      const updated = [...categories, { id: Date.now(), name: trimmed }];
      setCategories(updated);
      persistCategories(updated);
      return true;
    },
    [categories, persistCategories],
  );

  /** Renames a category by id. Returns false if the new name is blank. */
  const editCategory = useCallback(
    (id, newName) => {
      const trimmed = newName.trim();
      if (!trimmed) return false;

      const updated = categories.map((c) =>
        c.id === id ? { ...c, name: trimmed } : c,
      );
      setCategories(updated);
      persistCategories(updated);
      return true;
    },
    [categories, persistCategories],
  );

  /** Permanently removes a category by id. */
  const deleteCategory = useCallback(
    (id) => {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      persistCategories(updated);
    },
    [categories, persistCategories],
  );

  // ── Section CRUD ──────────────────────────────────────────────────────────

  /** Adds a homepage section. Returns false if title is blank. */
  const addSection = useCallback(
    ({ title, filterBy, visible = true }) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return false;

      const updated = [
        ...sections,
        { id: Date.now(), title: trimmedTitle, filterBy, visible },
      ];
      setSections(updated);
      persistSections(updated);
      return true;
    },
    [sections, persistSections],
  );

  /** Applies partial updates to an existing section by id. */
  const editSection = useCallback(
    (id, updatedFields) => {
      const updated = sections.map((s) =>
        s.id === id ? { ...s, ...updatedFields } : s,
      );
      setSections(updated);
      persistSections(updated);
    },
    [sections, persistSections],
  );

  /** Permanently removes a section by id. */
  const deleteSection = useCallback(
    (id) => {
      const updated = sections.filter((s) => s.id !== id);
      setSections(updated);
      persistSections(updated);
    },
    [sections, persistSections],
  );

  const value = useMemo(
    () => ({
      categories,
      sections,
      addCategory,
      editCategory,
      deleteCategory,
      addSection,
      editSection,
      deleteSection,
    }),
    [
      categories,
      sections,
      addCategory,
      editCategory,
      deleteCategory,
      addSection,
      editSection,
      deleteSection,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
