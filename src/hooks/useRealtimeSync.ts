import { useEffect, useState } from 'react'
import { TABLE_NAME } from '@/constants/tableName'
import supabase from '@/utils/supabase'
import type { Product } from '@/types/product'
import { getVisibleProducts } from '@/utils/product.utils'
import { VIEW_LISTADO } from '@/constants/views'

type UseRealtimeSyncProps = {
   activeButton: string
   setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
   setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

export function useRealtimeSync({
   activeButton,
   setAllProducts,
   setProducts,
}: UseRealtimeSyncProps) {
   const [isSync, setIsSync] = useState<boolean>(false)

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
               try {
                  // Validación básica
                  if (!payload?.eventType || (!payload?.new && !payload?.old)) {
                     console.warn('Datos inválidos:', payload)
                     return
                  }

                  const eventType = payload.eventType
                  const newProduct = payload.new as Product
                  const oldProduct = payload.old as Product

                  setIsSync(true)
                  setTimeout(() => setIsSync(false), 1500)

                  setAllProducts((prev) => {
                     let updated = [...prev]

                     switch (eventType) {
                        case 'INSERT':
                           if (
                              newProduct?.id &&
                              !prev.some((p) => p.id === newProduct.id)
                           ) {
                              updated = [...prev, newProduct]
                           }
                           break
                        case 'UPDATE':
                           if (newProduct?.id) {
                              updated = prev.map((p) =>
                                 p.id === newProduct.id ? newProduct : p
                              )
                           }
                           break
                        case 'DELETE':
                           if (oldProduct?.id) {
                              updated = prev.filter(
                                 (p) => p.id !== oldProduct.id
                              )
                           }
                           break
                     }

                     // Actualizar vista filtrada
                     if (activeButton === VIEW_LISTADO) {
                        const visibles = getVisibleProducts(updated)
                        setProducts(visibles)
                     } else {
                        const ocultos = updated.filter((p) => p.isProductHidden)
                        setProducts(ocultos)
                     }

                     return updated
                  })
               } catch (error) {
                  console.error('Error en sync:', error)
               }
            }
         )
         .on('system', {}, (status) => {
            if (status === 'CHANNEL_ERROR') {
               console.error('Conexión perdida, recargando...')
               setTimeout(() => window.location.reload(), 3000)
            }
         })
         .subscribe()

      return () => {
         supabase.removeChannel(channel)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeButton])

   return { isSync, setIsSync }
}
