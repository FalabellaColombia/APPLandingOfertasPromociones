import { columns } from '@/tables/productColumns'
import {
   type SortingState,
   useReactTable,
   getCoreRowModel,
   getFilteredRowModel,
   getSortedRowModel,
   getPaginationRowModel,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useProducts } from './useProducts'
import { useFilters } from './useFilters'

export function useTableConfig() {
   const { columnFilters, setColumnFilters } = useFilters()
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'orderSellout', desc: false },
   ])

   const {
      pagination,
      setPagination,
      products,
      isLoading,
      openDrawer,
      setOpenDrawer,
      activeButton,
      isFormOrderSelloutOpen,
   } = useProducts()

   const table = useReactTable({
      data: products,
      columns: columns,
      state: {
         pagination,
         columnFilters,
         sorting,
      },
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
   })

   return {
      table,
      isLoading,
      openDrawer,
      setOpenDrawer,
      activeButton,
      isFormOrderSelloutOpen,
      pagination,
      setPagination,
      columnFilters,
      setColumnFilters,
      sorting,
      setSorting,
      products,
   }
}
