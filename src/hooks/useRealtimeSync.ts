import { TABLE_NAME } from "@/constants/tableName";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { Product } from "@/types/product";
import type { UseRealtimeSyncProps } from "@/types/sync";
import { getHiddenProducts, getVisibleProducts } from "@/utils/product.utils";
import supabase from "@/utils/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useRealtimeSync({
  currentView,
  setAllProducts,
  setDisplayedProducts,
  updateLastRealtimeEvent
}: UseRealtimeSyncProps) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // Maneja eventos en tiempo real de Supabase
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<Product>) => {
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

      const filtered = currentView === VIEW_VISIBLEPRODUCTS ? getVisibleProducts(updated) : getHiddenProducts(updated);
      setDisplayedProducts(filtered);

      // Actualiza el timestamp de último evento
      updateLastRealtimeEvent?.();

      return updated;
    });
  };

  // Configura el canal de Supabase y suscripción a eventos
  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE_NAME }, handleRealtimeEvent)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (["CLOSED", "CHANNEL_ERROR", "TIMED_OUT"].includes(status)) {
          setConnectionStatus("disconnected");
        }
      });

    // Limpiar canal al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // Reintento automático de conexión si se desconecta
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      const retry = setTimeout(() => setConnectionStatus("connecting"), 5000);
      return () => clearTimeout(retry);
    }
  }, [connectionStatus]);

  return { connectionStatus };
}
