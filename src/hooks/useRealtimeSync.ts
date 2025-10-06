import { TABLE_NAME } from "@/constants/tableName";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { Product } from "@/types/product";
import type { UseRealtimeSyncProps } from "@/types/sync";
import { getHiddenProducts, getVisibleProducts } from "@/utils/product.utils";
import supabase from "@/utils/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect } from "react";

/**
 * Hook que mantiene el estado sincronizado en tiempo real con Supabase
 * Escucha eventos INSERT, UPDATE y DELETE de la tabla de productos
 * y actualiza el estado global automáticamente
 */
export function useRealtimeSync({
  currentView,
  setAllProducts,
  setDisplayedProducts,
  updateLastRealtimeEvent
}: UseRealtimeSyncProps) {
  /**
   * Procesa eventos de Realtime y actualiza el estado global
   * Se ejecuta cada vez que Supabase emite un cambio en la tabla
   */
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

        // Notificar al hook SyncManager que Realtime sigue activo
        // Esto previene re-sincronizaciones innecesarias
        updateLastRealtimeEvent();

        return updated;
      });
    } catch (error) {
      console.error("[REALTIME] Error procesando evento:", error);
    } 
  };

  /**
   * Establece conexión con el canal de Realtime de Supabase
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
