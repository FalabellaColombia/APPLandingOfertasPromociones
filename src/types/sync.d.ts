import type { Product } from "@/types/product";

export type UseRealtimeSyncProps = {
  currentView: string;
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setDisplayedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateLastRealtimeEvent: () => void;
  setIsSync: React.Dispatch<React.SetStateAction<boolean>>;
  syncProducts: () => Promise<void>;
};

export type useSyncManagerProps = {
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setDisplayedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentView: string;
  setIsSync: React.Dispatch<React.SetStateAction<boolean>>;
};
