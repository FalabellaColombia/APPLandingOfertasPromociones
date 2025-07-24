import { useEffect, useRef } from 'react'
import { getAllProducts } from '@/api/products'
import { getVisibleProducts } from '@/utils/product.utils'
import { VIEW_LISTADO } from '@/constants/views'
import type { Product } from '@/types/product'

type useSyncManagerProps = {
   setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
   setProducts: React.Dispatch<React.SetStateAction<Product[]>>
   activeButton: string
   setIsSync: React.Dispatch<React.SetStateAction<boolean>>
}

export function useSyncManager({
   setAllProducts,
   setProducts,
   activeButton,
   setIsSync,
}: useSyncManagerProps) {
   const lastActiveTime = useRef(Date.now())
   const lastRealtimeEvent = useRef(Date.now())
   const isOnline = useRef(navigator.onLine)

   const syncData = async () => {
      try {
         setIsSync(true)
         const freshData = await getAllProducts()
         setAllProducts(freshData)
         setProducts(
            activeButton === VIEW_LISTADO
               ? getVisibleProducts(freshData)
               : freshData.filter((p) => p.isProductHidden)
         )
         lastActiveTime.current = Date.now()
      } catch (error) {
         console.error('Sync failed:', error)
      } finally {
         setIsSync(false)
      }
   }

   const shouldSync = () => {
      const timeAway = Date.now() - lastActiveTime.current
      const noRealtimeEvents = Date.now() - lastRealtimeEvent.current

      return timeAway > 60000 || noRealtimeEvents > 120000 || !isOnline.current
   }

   const handleVisibilityChange = () => {
      if (!document.hidden && shouldSync()) {
         console.log('Document is visible, syncing data...')
         syncData()
      }
      if (!document.hidden) lastActiveTime.current = Date.now()
   }

   const handleOnlineChange = () => {
      const wasOffline = !isOnline.current
      isOnline.current = navigator.onLine
      console.log(
         `Network status changed: ${isOnline.current ? 'Online' : 'Offline'}`
      )

      if (navigator.onLine && wasOffline) {
         console.log('Back online, syncing data...')
         syncData()
      }
   }

   const markRealtimeActive = () => {
      lastRealtimeEvent.current = Date.now()
   }

   useEffect(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleVisibilityChange)
      window.addEventListener('online', handleOnlineChange)
      window.addEventListener('offline', handleOnlineChange)

      return () => {
         document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
         )
         window.removeEventListener('focus', handleVisibilityChange)
         window.removeEventListener('online', handleOnlineChange)
         window.removeEventListener('offline', handleOnlineChange)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeButton])

   return { markRealtimeActive, setIsSync }
}
