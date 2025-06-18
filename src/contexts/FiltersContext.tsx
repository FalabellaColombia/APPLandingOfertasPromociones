import { createContext } from 'react'
import type useFiltersProvider from '@/hooks/useFiltersProvider'

export const FiltersContext = createContext<
   ReturnType<typeof useFiltersProvider> | undefined
>(undefined)
