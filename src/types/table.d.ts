import type { useTableConfig } from "@/hooks/useTableConfig";
import type { Product } from "./product";

export interface TableHeader {
  currentView: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFormOrderSelloutOpen: boolean;
}

export interface TableProductsBody {
  isLoading: boolean;
  displayedProducts: Product[];
  table: ReturnType<typeof useTableConfig>["table"];
}
