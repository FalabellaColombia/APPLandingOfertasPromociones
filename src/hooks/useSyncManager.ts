import { getAllProducts } from "@/api/products";
import Sonner from "@/components/Sonner";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { UseSyncManagerProps } from "@/types/sync";
import { getHiddenProducts, getVisibleProducts } from "@/utils/product.utils";
import { useEffect, useRef, useState } from "react";

/**
 * Hook que mantiene sincronizados los productos cuando Realtime falla o se desconecta.
 * Detecta:
 * - Suspensión del equipo (>5 min)
 * - Cambio de pestaña (>1 min inactiva)
 * - Pérdida o regreso de internet
 * - Falta de eventos de Realtime (>2 min)
 */
export function useSyncManager({ setAllProducts, setDisplayedProducts, currentView }: UseSyncManagerProps) {
  // Tiempos de control
  const lastSyncTimeRef = useRef<number>(Date.now());
  const lastRealtimeEventRef = useRef<number>(Date.now());
  const lastVisibilityChangeRef = useRef<number>(0);

  // Estado y flag de control
  const syncInProgressRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Realiza una sincronización completa con la base de datos.
   * Evita múltiples sincronizaciones simultáneas y muestra notificaciones según el contexto.
   */
  const fullResync = async (showNotification = false) => {
    // Evita sincronizar sin conexión
    if (!navigator.onLine) return;

    // Evita ejecutar otra sincronización si ya hay una en curso
    if (syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);

    try {
      // Notificación opcional (por ejemplo, al volver a una pestaña activa)
      if (showNotification) {
        Sonner({ message: "Sincronizando datos...", sonnerState: "info" });
      }

      const products = await getAllProducts();
      setAllProducts(products);

      const filtered =
        currentView === VIEW_VISIBLEPRODUCTS ? getVisibleProducts(products) : getHiddenProducts(products);
      setDisplayedProducts(filtered);

      // Muestra confirmación si aplica
      if (showNotification) {
        Sonner({ message: "Datos actualizados", sonnerState: "success" });
      }
    } catch (error) {
      console.error(error);
      Sonner({ message: "Error al sincronizar", sonnerState: "error" });
    } finally {
      // Limpieza del estado sin importar el resultado
      setTimeout(() => {
        syncInProgressRef.current = false;
        setIsSyncing(false);
      }, 2000);
    }
  };

  /**
   * Marca el último evento recibido por Realtime.
   * Permite detectar si ha pasado demasiado tiempo sin actividad.
   */
  const updateLastRealtimeEvent = () => {
    lastRealtimeEventRef.current = Date.now();
  };

  /**
   * Detecta suspensión del equipo.
   * Si el tiempo entre intervalos supera los 5 minutos, se asume que el dispositivo estuvo suspendido.
   */
  useEffect(() => {
    const checkSuspension = () => {
      const now = Date.now();
      if (now - lastSyncTimeRef.current > 5 * 60 * 1000) {
        fullResync(false);
      }
      lastSyncTimeRef.current = now;
    };

    const interval = setInterval(checkSuspension, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  /**
   * Detecta cuando el usuario vuelve a la pestaña después de un tiempo inactiva.
   * Si han pasado más de 60s desde la última sync o 120s desde el último evento Realtime, se sincroniza.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      const sinceVisibility = now - lastVisibilityChangeRef.current;
      if (sinceVisibility < 60000) return; // throttle

      const sinceSync = now - lastSyncTimeRef.current;
      const sinceRealtime = now - lastRealtimeEventRef.current;

      if (sinceSync > 60000 || sinceRealtime > 120000) {
        lastSyncTimeRef.current = now;
        lastVisibilityChangeRef.current = now;
        fullResync(false);
      } else {
        lastSyncTimeRef.current = now;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  /**
   * Detecta recuperación de conexión.
   * Cuando vuelve internet, fuerza una sincronización.
   */
  useEffect(() => {
    const handleOnline = () => {
      Sonner({ message: "Conexión restaurada", sonnerState: "success" });
      fullResync(false);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  return {
    updateLastRealtimeEvent,
    forceResync: () => fullResync(true),
    isSyncing,
    setIsSyncing
  };
}
