'use client'

import { useState, useEffect } from 'react'
import { ListFilter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuCheckboxItem,
   DropdownMenuContent,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ColumnFiltersState } from '@tanstack/react-table'

interface FilterButtonProps {
   columnFilters: ColumnFiltersState
   setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

const allCategories = [
   'Tecnologia',
   'Electrohogar',
   'VestuarioMujer',
   'VestuarioHombre',
   'Infantil',
   'Calzado',
   'Belleza',
   'AccesoriosModa',
   'Hogar',
   'Deportes',
   'Otros',
]

export default function FilterButton({ setColumnFilters }: FilterButtonProps) {
   const [selectedCategories, setSelectedCategories] = useState<string[]>([])

   const toggleSelection = (
      currentValues: string[],
      value: string,
      setter: (values: string[]) => void
   ) => {
      if (currentValues.includes(value)) {
         setter(currentValues.filter((item) => item !== value))
      } else {
         setter([...currentValues, value])
      }
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

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline">
               <ListFilter size={16} />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
            {allCategories.map((category) => (
               <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                     toggleSelection(
                        selectedCategories,
                        category,
                        setSelectedCategories
                     )
                  }>
                  {category}
               </DropdownMenuCheckboxItem>
            ))}
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
