import type { Product } from '@/types/product'

export type UseRealtimeSyncProps = {
   activeButton: string
   setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
   setProducts: React.Dispatch<React.SetStateAction<Product[]>>
   markRealtimeActive: () => void
   setIsSync: React.Dispatch<React.SetStateAction<boolean>>
   syncProducts: () => Promise<void>
}

export type useSyncManagerProps = {
   setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
   setProducts: React.Dispatch<React.SetStateAction<Product[]>>
   activeButton: string
   setIsSync: React.Dispatch<React.SetStateAction<boolean>>
}
