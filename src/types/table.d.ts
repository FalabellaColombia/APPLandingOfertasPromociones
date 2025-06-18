import type { useTableConfig } from '@/hooks/useTableConfig'
import type { Product } from './product'

export interface TableHeader {
   activeButton: string
   openDrawer: boolean
   setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>
   isFormOrderSelloutOpen: boolean
}

export interface TableProductsBody {
   isLoading: boolean
   products: Product[]
   table: ReturnType<typeof useTableConfig>['table']
}
