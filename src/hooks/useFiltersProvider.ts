import { useEffect, useState } from 'react'
import type { ColumnFiltersState } from '@tanstack/react-table'

export default function useFiltersProvider() {
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
   const [selectedCategories, setSelectedCategories] = useState<string[]>([])

   const toggleCategory = (value: string) => {
      setSelectedCategories((prev) =>
         prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value]
      )
   }

   useEffect(() => {
      setColumnFilters((prev) => {
         const withoutCategory = prev.filter((f) => f.id !== 'category')
         return selectedCategories.length > 0
            ? [
                 ...withoutCategory,
                 { id: 'category', value: selectedCategories },
              ]
            : withoutCategory
      })
   }, [selectedCategories])

   return {
      selectedCategories,
      setSelectedCategories,
      toggleCategory,
      columnFilters,
      setColumnFilters,
   }
}
