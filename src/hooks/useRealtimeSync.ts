import { TABLE_NAME } from "@/constants/tableName";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { Product } from "@/types/product";
import type { UseRealtimeSyncProps } from "@/types/sync";
import { getHiddenProducts, getVisibleProducts } from "@/utils/product.utils";
import supabase from "@/utils/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect } from "react";

/**
 * Realtime synchronization layer for products.
 *
 * Keeps the local products state in sync with Supabase changes in real time.
 * This hook is the primary source of truth for live updates and works together
 * with the SyncManager as a fallback when Realtime becomes inactive.
 */
export function useRealtimeSync({
  currentView,
  setAllProducts,
  setDisplayedProducts,
  updateLastRealtimeEvent
}: UseRealtimeSyncProps) {
  // Applies database changes (INSERT / UPDATE / DELETE) to local state
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<Product>) => {
    try {
      setAllProducts((prev) => {
        let updated = [...prev];

        switch (payload.eventType) {
          case "INSERT":
            if (payload.new && !prev.some((p) => p.id === payload.new.id)) {
              updated = [...prev, payload.new];
            }
            break;

          case "UPDATE":
            if (payload.new) {
              updated = prev.map((p) => (p.id === payload.new.id ? payload.new : p));
            }
            break;

          case "DELETE":
            if (payload.old) {
              updated = prev.filter((p) => p.id !== payload.old.id);
            }
            break;
        }

        updated.sort((a, b) => a.orderSellout - b.orderSellout);

        const filtered =
          currentView === VIEW_VISIBLEPRODUCTS ? getVisibleProducts(updated) : getHiddenProducts(updated);

        setDisplayedProducts(filtered);

        // Signals that Realtime is active to avoid unnecessary full syncs
        updateLastRealtimeEvent();

        return updated;
      });
    } catch (error) {
      console.error("[REALTIME] Error while processing event:", error);
    }
  };

  /**
   * Subscribes to Supabase Realtime changes for products.
   * Automatically cleans up the channel on unmount or view change.
   */
  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE_NAME }, handleRealtimeEvent)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);
}
