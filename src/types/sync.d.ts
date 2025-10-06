import type { Product } from "@/types/product";

export type UseRealtimeSyncProps = {
  currentView: string;
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setDisplayedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateLastRealtimeEvent: () => void;
};

export type UseSyncManagerProps = {
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setDisplayedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentView: string;
};
