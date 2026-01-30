import type { ColumnFiltersState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useProducts } from "./useProducts";

/**
 * Filters state manager used to keep table filters, selected categories,
 * and pagination behavior in sync.
 *
 * Centralizes filter-related logic to ensure consistent table state
 * when category filters change.
 */
export default function useFiltersProvider() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { setPagination } = useProducts();

  // Toggles a category filter and resets pagination
  // to avoid landing on invalid pages after filtering
  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

    // Reset page index whenever filters change
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Keeps TanStack Table column filters in sync
  // with the selected categories state
  useEffect(() => {
    setColumnFilters((prev) => {
      const withoutCategory = prev.filter((f) => f.id !== "category");

      return selectedCategories.length > 0
        ? [...withoutCategory, { id: "category", value: selectedCategories }]
        : withoutCategory;
    });
  }, [selectedCategories]);

  return {
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    columnFilters,
    setColumnFilters
  };
}
