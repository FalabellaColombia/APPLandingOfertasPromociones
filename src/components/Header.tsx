import { VIEW_HIDDENPRODUCTS, VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import Logout from "@/features/auth/components/Logout";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { getHiddenProducts, getVisibleProducts } from "@/utils/product.utils";
import { RefreshCcw } from "lucide-react";
import appLogo from "../assets/appLogo.svg";
import DarkMode from "./DarkMode";
import MenuButton from "./MenuButton";
import SyncButton from "./SyncButton";

function Header() {
  const { allProducts, currentView, setCurrentView, setPagination, setDisplayedProducts, isSync } = useProducts();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-10 mt-4 mb-7">
        <a
          className="flex items-center space-x-3 "
          href="https://www.falabella.com.co/falabella-co/page/descuentos_ofertas_falabella?sid=HO_V1_ENCUENTRAACALASOFERTASIMPERDIBLESDELASEMANA_OTROS_NA_S17_139"
          target="_blank"
        >
          <img src={appLogo} alt="APP Landing Ofertas y Promociones" width={25} height={25} />
          <h1
            className="text-sm font-bold tracking-tight 
               text-zinc-900 hover:text-zinc-500 
               dark:text-white dark:hover:text-zinc-300
               transition duration-200 ease-in-out"
          >
            APP Landing
          </h1>
        </a>
      </div>

      <div className="flex space-x-2">
        <MenuButton
          text={VIEW_VISIBLEPRODUCTS}
          functionOnClick={() => {
            const visibleProducts = getVisibleProducts(allProducts);
            setDisplayedProducts(visibleProducts);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            setCurrentView(VIEW_VISIBLEPRODUCTS);
          }}
          isActive={currentView === VIEW_VISIBLEPRODUCTS}
        />

        <MenuButton
          text={VIEW_HIDDENPRODUCTS}
          functionOnClick={() => {
            const hiddenProducts = getHiddenProducts(allProducts);
            setDisplayedProducts(hiddenProducts);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            setCurrentView(VIEW_HIDDENPRODUCTS);
          }}
          isActive={currentView === VIEW_HIDDENPRODUCTS}
        />
      </div>

      <div className="flex space-x-2">
        <div className="flex space-x-2 border-r-2 pr-2">
          <div
            className={cn(
              "size-9 rounded-md flex items-center justify-center transition-all duration-250 ease-in-out",
              isSync ? "opacity-100 spin-reverse text-lime-500" : "opacity-0 pointer-events-none"
            )}
            title="Sincronizando cambios en tiempo real"
          >
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
  );
}

export default Header;
