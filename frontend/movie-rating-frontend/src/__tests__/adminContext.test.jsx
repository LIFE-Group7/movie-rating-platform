import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AdminProvider, useAdmin } from "../contexts/AdminContext";

const wrapper = ({ children }) => <AdminProvider>{children}</AdminProvider>;

describe("Category management — useAdmin", () => {
  beforeEach(() => localStorage.clear());

  it("adds a new category and returns true", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    let success;
    act(() => {
      success = result.current.addCategory("Fantasy");
    });
    expect(success).toBe(true);
    expect(result.current.categories.some((c) => c.name === "Fantasy")).toBe(
      true,
    );
  });

  it("rejects a blank category name and returns false", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    let success;
    act(() => {
      success = result.current.addCategory("   ");
    });
    expect(success).toBe(false);
  });

  it("rejects a duplicate category name (case-insensitive)", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    // Seed already contains "Action" — adding a case variant should fail
    let success;
    act(() => {
      success = result.current.addCategory("action");
    });
    expect(success).toBe(false);
  });

  it("edits a category name by id", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    const { id } = result.current.categories[0];
    act(() => {
      result.current.editCategory(id, "Updated");
    });
    expect(result.current.categories.find((c) => c.id === id)?.name).toBe(
      "Updated",
    );
  });

  it("edit rejects a blank name and returns false", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    const { id } = result.current.categories[0];
    let success;
    act(() => {
      success = result.current.editCategory(id, "");
    });
    expect(success).toBe(false);
  });

  it("deletes a category by id", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    const { id } = result.current.categories[0];
    act(() => {
      result.current.deleteCategory(id);
    });
    expect(result.current.categories.find((c) => c.id === id)).toBeUndefined();
  });

  it("persists categories to localStorage", () => {
    const { result } = renderHook(() => useAdmin(), { wrapper });
    act(() => {
      result.current.addCategory("Persisted");
    });
    const stored = JSON.parse(localStorage.getItem("adminData:categories"));
    expect(stored.some((c) => c.name === "Persisted")).toBe(true);
  });
});
