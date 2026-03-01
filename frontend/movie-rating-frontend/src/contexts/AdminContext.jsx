/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  createDashboardGenre,
  createDashboardSection,
  deleteDashboardSection,
  fetchDashboardGenres,
  fetchDashboardSections,
  updateDashboardGenre,
  updateDashboardSection,
  updateDashboardGenreActivation,
} from "../api/dashboardApi";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin must be used within an AdminProvider");
  return context;
};

export function AdminProvider({ children }) {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadAdminData = async () => {
      if (!isAdmin) {
        setCategories([]);
        setSections([]);
        return;
      }

      try {
        const [apiCategories, apiSections] = await Promise.all([
          fetchDashboardGenres(),
          fetchDashboardSections(),
        ]);

        if (!mounted) return;
        setCategories(apiCategories);
        setSections(apiSections);
      } catch (error) {
        console.error("Failed to load admin dashboard data from API", error);
        if (!mounted) return;
        setCategories([]);
        setSections([]);
      }
    };

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  /** Adds a new category. Returns false if name is blank or already exists. */
  const addCategory = useCallback(
    (name) => {
      if (!isAdmin) return false;

      const trimmed = name.trim();
      if (!trimmed) return false;

      const isDuplicate = categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (isDuplicate) return false;

      return (async () => {
        try {
          const created = await createDashboardGenre(trimmed);
          setCategories((prev) => [...prev, created]);
          return true;
        } catch (error) {
          console.error("Failed to create category", error);
          return false;
        }
      })();
    },
    [categories, isAdmin],
  );

  /** Renames a category by id. Returns false if the new name is blank. */
  const editCategory = useCallback(
    (id, newName, isActive) => {
      if (!isAdmin) return false;

      const trimmed = newName.trim();
      if (!trimmed) return false;

      return (async () => {
        try {
          const updatedCategory = await updateDashboardGenre(
            id,
            trimmed,
            isActive,
          );
          setCategories((prev) =>
            prev.map((c) => (c.id === id ? updatedCategory : c)),
          );
          return true;
        } catch (error) {
          console.error("Failed to update category", error);
          return false;
        }
      })();
    },
    [isAdmin],
  );

  const updateCategoryActivation = useCallback(
    async (id, name, isActive) => {
      if (!isAdmin) return;

      try {
        const updatedCategory = await updateDashboardGenreActivation(
          id,
          name,
          isActive,
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updatedCategory : c)),
        );
      } catch (error) {
        console.error("Failed to update category activation", error);
      }
    },
    [isAdmin],
  );

  /** Removes a category by id. */
  const deleteCategory = useCallback(
    (id) => {
      if (!isAdmin) return;

      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
    },
    [categories, isAdmin],
  );

  // ── Section CRUD ──────────────────────────────────────────────────────────

  /** Adds a homepage section. Returns false if title is blank. */
  const addSection = useCallback(
    ({ title, filterBy, visible = true }) => {
      if (!isAdmin) return false;

      const trimmedTitle = title.trim();
      if (!trimmedTitle) return false;

      return (async () => {
        try {
          const created = await createDashboardSection({
            title: trimmedTitle,
            filterBy,
            visible,
          });
          setSections((prev) => [...prev, created]);
          return true;
        } catch (error) {
          console.error("Failed to create section", error);
          return false;
        }
      })();
    },
    [isAdmin],
  );

  /** Applies partial updates to an existing section by id. */
  const editSection = useCallback(
    (id, updatedFields) => {
      if (!isAdmin) return false;

      return (async () => {
        const sectionToUpdate = sections.find((s) => s.id === id);
        if (!sectionToUpdate) return false;

        const payload = { ...sectionToUpdate, ...updatedFields };
        if (!payload.title?.trim()) return false;

        try {
          const updatedSection = await updateDashboardSection(id, payload);
          setSections((prev) =>
            prev.map((s) => (s.id === id ? updatedSection : s)),
          );
          return true;
        } catch (error) {
          console.error("Failed to update section", error);
          return false;
        }
      })();
    },
    [sections, isAdmin],
  );

  /** Permanently removes a section by id. */
  const deleteSection = useCallback(
    (id) => {
      if (!isAdmin) return;

      return (async () => {
        try {
          await deleteDashboardSection(id);
          setSections((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
          console.error("Failed to delete section", error);
        }
      })();
    },
    [isAdmin],
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
      updateCategoryActivation,
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
      updateCategoryActivation,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
