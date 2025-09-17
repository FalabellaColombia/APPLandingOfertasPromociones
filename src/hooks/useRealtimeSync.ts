import Sonner from "@/components/Sonner";
import { TABLE_NAME } from "@/constants/tableName";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { Product } from "@/types/product";
import type { UseRealtimeSyncProps } from "@/types/sync";
import { getVisibleProducts } from "@/utils/product.utils";
import supabase from "@/utils/supabase";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

export function useRealtimeSync({
  currentView,
  setAllProducts,
  setDisplayedProducts,
  markRealtimeActive,
  setIsSync,
  syncProducts
}: UseRealtimeSyncProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const maxRetries = 3;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<Product>) => {
    try {
      markRealtimeActive();
      setIsSync(true);

      if (!payload?.eventType) {
        setIsSync(false);
        return;
      }

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
              console.log("update1");
              updated = prev.map((p) => (p.id === payload.new.id ? payload.new : p));

              // Detectar rebalanceo (muchos productos actualizados a la vez)
              const isRebalance = updated.filter((p) => p.orderSellout % 100 === 0 && p.orderSellout > 0).length > 3; // Si varios productos tienen valores como 100, 200, etc.

              if (isRebalance) {
                console.log("update2");
                // Ordenar todos los productos
                updated.sort((a, b) => a.orderSellout - b.orderSellout);
              } else if (payload.new.orderSellout !== payload.old?.orderSellout) {
                // Ordenar solo si cambió el orderSellout de este producto
                updated.sort((a, b) => a.orderSellout - b.orderSellout);
              }
              console.log("update3");
            }
            console.log("update4");
            break;
          case "DELETE":
            if (payload.old) {
              updated = prev.filter((p) => p.id !== payload.old.id);
            }
            break;
        }

        // Filtrar y ordenar los productos visibles/ocultos según corresponda
        const filteredProducts =
          currentView === VIEW_VISIBLEPRODUCTS ? getVisibleProducts(updated) : updated.filter((p) => p.isProductHidden);

        // Asegurar ordenamiento
        const sortedProducts = [...filteredProducts].sort((a, b) => a.orderSellout - b.orderSellout);
        setDisplayedProducts(sortedProducts);

        return updated;
      });

      setTimeout(() => setIsSync(false), 1000);
    } catch (error) {
      console.error("Error en realtime:", error);
      setIsSync(false);
    }
  };

  // ... (resto del código se mantiene igual)
  const handleSystemEvent = async (status: string) => {
    switch (status) {
      case "SUBSCRIBED":
        if (isReconnecting) {
          Sonner({
            message: "Se restableció la conexión en tiempo real. Actualizando productos...",
            sonnerState: "success"
          });
          setReconnectAttempts(0);
          setIsReconnecting(false);
          await syncProducts();
        }
        break;

      case "CHANNEL_ERROR":
      case "CHANNEL_CLOSED":
        if (reconnectAttempts < maxRetries && !isReconnecting) {
          setIsReconnecting(true);
          Sonner({
            message: `Se perdió la conexión en tiempo real. Reintentando (${reconnectAttempts + 1}/${maxRetries})...`,
            sonnerState: "warning"
          });
          setReconnectAttempts((prev) => prev + 1);
          attemptReconnection();
        } else if (!isReconnecting) {
          Sonner({
            message: "No se pudo restablecer la conexión en tiempo real. Recargando la aplicación...",
            sonnerState: "error"
          });
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
        break;
    }
  };

  const attemptReconnection = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      try {
        channelRef.current = createChannel();
      } catch (error) {
        console.error(error);
        setIsReconnecting(false);
        if (reconnectAttempts < maxRetries) {
          attemptReconnection();
        }
      }
    }, 3000);
  };

  const createChannel = () => {
    return supabase
      .channel("displayedProducts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE_NAME
        },
        handleRealtimeEvent
      )
      .on("system", {}, handleSystemEvent)
      .subscribe();
  };

  useEffect(() => {
    channelRef.current = createChannel();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {};
}
