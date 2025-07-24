import { RefreshCcw } from 'lucide-react'
import DarkMode from './DarkMode'
import MenuButton from './MenuButton'
import { useProducts } from '@/hooks/useProducts'
import { VIEW_LISTADO, VIEW_OCULTOS } from '@/constants/views'
import {
   getHiddenProducts,
   getVisibleProducts,
   reorderOrderSellout,
} from '@/utils/product.utils'
import Logout from '@/features/auth/components/Logout'
import { cn } from '@/lib/utils'
import appLogo from '../assets/appLogo.svg'
import SyncButton from './SyncButton'

function Header() {
   const {
      allProducts,
      activeButton,
      setActiveButton,
      setPagination,
      setProducts,
      isSync,
   } = useProducts()

   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center space-x-10 mt-4 mb-7">
            <a
               className="flex items-center space-x-3 "
               href="https://www.falabella.com.co/falabella-co/page/descuentos_ofertas_falabella?sid=HO_V1_ENCUENTRAACALASOFERTASIMPERDIBLESDELASEMANA_OTROS_NA_S17_139"
               target="_blank">
               <img
                  src={appLogo}
                  alt="APP Landing Ofertas y Promociones"
                  width={25}
                  height={25}
               />
               <h1
                  className="text-sm font-bold tracking-tight 
               text-zinc-900 hover:text-zinc-500 
               dark:text-white dark:hover:text-zinc-300
               transition duration-200 ease-in-out">
                  APP Landing
               </h1>
            </a>
         </div>

         <div className="flex space-x-2">
            <MenuButton
               text={VIEW_LISTADO}
               functionOnClick={() => {
                  const visibleProducts = getVisibleProducts(allProducts)
                  const orderedProducts = reorderOrderSellout(visibleProducts)
                  setProducts(orderedProducts)
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  setActiveButton(VIEW_LISTADO)
               }}
               isActive={activeButton === VIEW_LISTADO}
            />

            <MenuButton
               text={VIEW_OCULTOS}
               functionOnClick={() => {
                  const hidden = getHiddenProducts(allProducts)
                  setProducts(hidden)
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  setActiveButton(VIEW_OCULTOS)
               }}
               isActive={activeButton === VIEW_OCULTOS}
            />
         </div>

         <div className="flex space-x-2">
            <div className='flex space-x-2 border-r-2 pr-2'>
               <div
                  className={cn(
                     'size-9 rounded-md flex items-center justify-center transition-all duration-250 ease-in-out',
                     isSync
                        ? 'opacity-100 spin-reverse text-lime-500'
                        : 'opacity-0 pointer-events-none'
                  )}
                  title="Sincronizando cambios en tiempo real">
                  <RefreshCcw size={18} />
               </div>
               <SyncButton />
            </div>
            <div className="flex space-x-2 ">
               <DarkMode />
               <Logout />
            </div>
         </div>
      </div>
   )
}

export default Header
