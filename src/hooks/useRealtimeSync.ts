import { useEffect, useRef, useState } from 'react'
import { TABLE_NAME } from '@/constants/tableName'
import supabase from '@/utils/supabase'
import type { Product } from '@/types/product'
import { getVisibleProducts } from '@/utils/product.utils'
import { VIEW_LISTADO } from '@/constants/views'
import Sonner from '@/components/Sonner'
import type {
   RealtimeChannel,
   RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import type { UseRealtimeSyncProps } from '@/types/sync'

export function useRealtimeSync({
   activeButton,
   setAllProducts,
   setProducts,
   markRealtimeActive,
   setIsSync,
   syncProducts,
}: UseRealtimeSyncProps) {
   const channelRef = useRef<RealtimeChannel | null>(null)
   const [reconnectAttempts, setReconnectAttempts] = useState(0)
   const [isReconnecting, setIsReconnecting] = useState(false)
   const maxRetries = 3
   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

   const handleRealtimeEvent = (
      payload: RealtimePostgresChangesPayload<Product>
   ) => {
      try {
         markRealtimeActive()
         setIsSync(true)

         if (!payload?.eventType || (!payload?.new && !payload?.old)) {
            setIsSync(false)
            return
         }

         const eventType = payload.eventType
         const newProduct = payload.new as Product
         const oldProduct = payload.old as Product

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
                     updated = prev.filter((p) => p.id !== oldProduct.id)
                  }
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

         setTimeout(() => setIsSync(false), 1000)
      } catch (error) {
         console.log(error)
         setIsSync(false)
      }
   }

   const handleSystemEvent = async (status: string) => {
      switch (status) {
         case 'SUBSCRIBED':
            if (isReconnecting) {
               Sonner({
                  message:
                     'Se restableció la conexión en tiempo real. Actualizando productos...',
                  sonnerState: 'success',
               })
               setReconnectAttempts(0)
               setIsReconnecting(false)
               await syncProducts()
            }
            break

         case 'CHANNEL_ERROR':
         case 'CHANNEL_CLOSED':
            if (reconnectAttempts < maxRetries && !isReconnecting) {
               setIsReconnecting(true)
               Sonner({
                  message: `Se perdió la conexión en tiempo real. Reintentando (${
                     reconnectAttempts + 1
                  }/${maxRetries})...`,
                  sonnerState: 'warning',
               })
               setReconnectAttempts((prev) => prev + 1)
               attemptReconnection()
            } else if (!isReconnecting) {
               Sonner({
                  message:
                     'No se pudo restablecer la conexión en tiempo real. Recargando la aplicación...',
                  sonnerState: 'error',
               })

               setTimeout(() => {
                  window.location.reload()
               }, 3000)
            }
            break
      }
   }

   const attemptReconnection = () => {
      if (channelRef.current) {
         supabase.removeChannel(channelRef.current)
         channelRef.current = null
      }

      reconnectTimeoutRef.current = setTimeout(() => {
         try {
            channelRef.current = createChannel()
         } catch (error) {
            console.error(error)
            setIsReconnecting(false)
            if (reconnectAttempts < maxRetries) {
               attemptReconnection()
            }
         }
      }, 3000)
   }

   const createChannel = () => {
      return supabase
         .channel('products-realtime')
         .on(
            'postgres_changes',
            {
               event: '*',
               schema: 'public',
               table: TABLE_NAME,
            },
            handleRealtimeEvent
         )
         .on('system', {}, handleSystemEvent)
         .subscribe()
   }

   useEffect(() => {
      channelRef.current = createChannel()

      return () => {
         if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
         }

         if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return {}
}
