import { useProductsProvider } from '../hooks/useProductsProvider'
import type { ReactNode } from 'react'
import { ProductsContext } from './ProductsContext'

export function ProductsProvider({ children }: { children: ReactNode }) {
   const value = useProductsProvider()

   return (
      <ProductsContext.Provider value={value}>
         {children}
      </ProductsContext.Provider>
   )
}
