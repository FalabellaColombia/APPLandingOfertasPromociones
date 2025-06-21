// src/hooks/useRealtimeSync.ts

import { useEffect } from 'react'
import { TABLE_NAME } from '@/constants/tableName'
import supabase from '@/utils/supabase'
import type { Product } from '@/types/product'
import { getVisibleProducts } from '@/utils/product.utils'
import { VIEW_LISTADO } from '@/constants/views'

type UseRealtimeSyncProps = {
   activeButton: string
   setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
   setProducts: React.Dispatch<React.SetStateAction<Product[]>>
   setIsSync: React.Dispatch<React.SetStateAction<boolean>>
}

export function useRealtimeSync({
   activeButton,
   setAllProducts,
   setProducts,
   setIsSync,
}: UseRealtimeSyncProps) {
   
   useEffect(() => {
      const channel = supabase
         .channel('products-realtime')
         .on(
            'postgres_changes',
            {
               event: '*',
               schema: 'public',
               table: TABLE_NAME,
            },
            (payload) => {
               const eventType = payload.eventType
               const newProduct = payload.new as Product
               const oldProduct = payload.old as Product

               setIsSync(true)

               setTimeout(() => {
                  setIsSync(false)
               }, 1500)

               setAllProducts((prev) => {
                  let updated = [...prev]

                  switch (eventType) {
                     case 'INSERT':
                        updated = [...prev, newProduct]
                        break
                     case 'UPDATE':
                        updated = prev.map((p) =>
                           p.id === newProduct.id ? newProduct : p
                        )
                        break
                     case 'DELETE':
                        updated = prev.filter((p) => p.id !== oldProduct.id)
                        break
                  }

                  if (activeButton === VIEW_LISTADO) {
                     const visibles = getVisibleProducts(updated)
                     setProducts(visibles)
                  } else {
                     const ocultos = updated.filter((p) => p.isProductHidden)
                     setProducts(ocultos)
                  }

                  return updated
               })
            }
         )
         .subscribe()

      return () => {
         supabase.removeChannel(channel)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeButton])
}
