import { columns } from "@/tables/productColumns";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import { useState } from "react";
import { useFilters } from "./useFilters";
import { useProducts } from "./useProducts";

export function useTableConfig() {
  const { columnFilters, setColumnFilters } = useFilters();
  const [sorting, setSorting] = useState<SortingState>([]);
  //const [sorting, setSorting] = useState<SortingState>([{ id: "orderSellout", desc: false }]);

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

  const table = useReactTable({
    data: displayedProducts,
    columns: columns,
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
