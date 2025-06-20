import { FiltersContext } from '@/contexts/FiltersContext'
import { useContext } from 'react'

export function useFilters() {
   const context = useContext(FiltersContext)

   if (context === undefined) {
      throw new Error('useFilters debe usarse dentro de un <filtersProvider>')
   }

   return context
}
