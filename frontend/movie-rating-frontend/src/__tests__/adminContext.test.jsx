import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AdminProvider, useAdmin } from "../contexts/AdminContext";

let mockGenres = [];
let mockSections = [];
let nextGenreId = 100;

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ isAdmin: true }),
}));

vi.mock("../api/dashboardApi", () => ({
  fetchDashboardGenres: vi.fn(async () => [...mockGenres]),
  fetchDashboardSections: vi.fn(async () => [...mockSections]),
  createDashboardGenre: vi.fn(async (name) => {
    const created = { id: nextGenreId++, name, isActive: false };
    mockGenres = [...mockGenres, created];
    return created;
  }),
  updateDashboardGenre: vi.fn(async (id, name, isActive) => {
    const updated = { id, name, isActive };
    mockGenres = mockGenres.map((g) => (g.id === id ? updated : g));
    return updated;
  }),
  updateDashboardGenreActivation: vi.fn(async (id, name, isActive) => {
    const updated = { id, name, isActive };
    mockGenres = mockGenres.map((g) => (g.id === id ? updated : g));
    return updated;
  }),
  createDashboardSection: vi.fn(async (section) => {
    const created = {
      id: Date.now(),
      title: section.title,
      filterBy: section.filterBy,
      visible: section.visible,
    };
    mockSections = [...mockSections, created];
    return created;
  }),
  updateDashboardSection: vi.fn(async (id, section) => {
    const updated = {
      id,
      title: section.title,
      filterBy: section.filterBy,
      visible: section.visible,
    };
    mockSections = mockSections.map((s) => (s.id === id ? updated : s));
    return updated;
  }),
  deleteDashboardSection: vi.fn(async (id) => {
    mockSections = mockSections.filter((s) => s.id !== id);
  }),
}));

const wrapper = ({ children }) => <AdminProvider>{children}</AdminProvider>;

const waitForCategories = async (result) => {
  await waitFor(() => {
    expect(result.current.categories.length).toBeGreaterThan(0);
  });
};

describe("Category management — useAdmin", () => {
  beforeEach(() => {
    mockGenres = [
      { id: 1, name: "Action", isActive: false },
      { id: 2, name: "Comedy", isActive: false },
      { id: 3, name: "Drama", isActive: false },
    ];
    mockSections = [];
    nextGenreId = 100;
  });

  it("adds a new category and returns true", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitForCategories(result);

    let success;
    await act(async () => {
      success = await result.current.addCategory("Fantasy");
    });

    expect(success).toBe(true);
    expect(result.current.categories.some((c) => c.name === "Fantasy")).toBe(
      true,
    );
  });

  it("rejects a blank category name and returns false", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitForCategories(result);

    let success;
    await act(async () => {
      success = await result.current.addCategory("   ");
    });

    expect(success).toBe(false);
  });

  it("rejects a duplicate category name (case-insensitive)", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitForCategories(result);

    // Seed already contains "Action" — adding a case variant should fail
    let success;
    await act(async () => {
      success = await result.current.addCategory("action");
    });

    expect(success).toBe(false);
  });

  it("edits a category name by id", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitForCategories(result);

    const { id } = result.current.categories[0];
    await act(async () => {
      await result.current.editCategory(id, "Updated", false);
    });

    expect(result.current.categories.find((c) => c.id === id)?.name).toBe(
      "Updated",
    );
  });

  it("edit rejects a blank name and returns false", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitForCategories(result);

    const { id } = result.current.categories[0];
    let success;
    await act(async () => {
      success = await result.current.editCategory(id, "", false);
    });

    expect(success).toBe(false);
  });

  it("deletes a category by id", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitForCategories(result);

    const { id } = result.current.categories[0];
    act(() => {
      result.current.deleteCategory(id);
    });

    expect(result.current.categories.find((c) => c.id === id)).toBeUndefined();
  });

  it("loads categories from dashboard API", async () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    await waitFor(() => {
      expect(result.current.categories.map((c) => c.name)).toEqual([
        "Action",
        "Comedy",
        "Drama",
      ]);
    });
  });
});
