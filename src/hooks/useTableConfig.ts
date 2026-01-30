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
export function useTableConfig() {
  const { columnFilters, setColumnFilters } = useFilters();
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const tableColumns = useMemo(() => getColumns(currentView), [currentView]);
  
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
