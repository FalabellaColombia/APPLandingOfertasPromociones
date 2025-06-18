import type { ReactNode } from 'react'
import { FiltersContext } from './FiltersContext'
import useFiltersProvider from '@/hooks/useFiltersProvider'

export default function FiltersProvider({ children }: { children: ReactNode }) {
   const value = useFiltersProvider()

   return (
      <FiltersContext.Provider value={value}>
         {children}
      </FiltersContext.Provider>
   )
}
