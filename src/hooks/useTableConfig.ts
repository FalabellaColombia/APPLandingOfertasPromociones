import { getColumns } from "@/tables/productColumns";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useFilters } from "./useFilters";
import { useProducts } from "./useProducts";

// Centralizes TanStack Table configuration and state wiring
// for products, including filters, sorting and pagination
export function useTableConfig() {
  // Column-level filters (categories, etc.)
  const { columnFilters, setColumnFilters } = useFilters();

  // Sorting state for the table
  const [sorting, setSorting] = useState<SortingState>([]);

  // Product data and shared UI state
  const {
    pagination,
    setPagination,
    displayedProducts,
    isLoading,
    isDrawerOpen,
    setIsDrawerOpen,
    currentView,
    isFormOrderSelloutOpen
  } = useProducts();

  // Table columns depend on the current product view
  const tableColumns = useMemo(() => getColumns(currentView), [currentView]);

  // TanStack Table instance with all controlled state
  const table = useReactTable({
    data: displayedProducts,
    columns: tableColumns,
    state: {
      pagination,
      columnFilters,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return {
    table,
    isLoading,
    isDrawerOpen,
    setIsDrawerOpen,
    currentView,
    isFormOrderSelloutOpen,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    displayedProducts
  };
}
