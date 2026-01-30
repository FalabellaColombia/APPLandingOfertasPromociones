import { getAllProducts } from "@/api/products";
import Sonner from "@/components/Sonner";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { UseSyncManagerProps } from "@/types/sync";
import { getHiddenProducts, getVisibleProducts } from "@/utils/product.utils";
import { useEffect, useRef, useState } from "react";

/**
 * Synchronization safety net for multi-client environments.
 *
 * This hook acts as a fallback when Supabase Realtime becomes unreliable
 * or temporarily unavailable, ensuring local state consistency by
 * forcing a full resync under specific risk scenarios.
 */
export function useSyncManager({ setAllProducts, setDisplayedProducts, currentView }: UseSyncManagerProps) {
  // Timestamps used to detect stale state and missing Realtime activity
  const lastSyncTimeRef = useRef<number>(Date.now());
  const lastRealtimeEventRef = useRef<number>(Date.now());
  const lastVisibilityChangeRef = useRef<number>(0);

  // Guards against overlapping or redundant full synchronizations
  const syncInProgressRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Forces a full authoritative fetch from the database
  // Used only when Realtime cannot be trusted
  const fullResync = async (showNotification = false) => {
    if (!navigator.onLine) return;
    if (syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);

    try {
      if (showNotification) {
        Sonner({ message: "Syncing data...", sonnerState: "info" });
      }

      const products = await getAllProducts();
      setAllProducts(products);

      const filtered =
        currentView === VIEW_VISIBLEPRODUCTS ? getVisibleProducts(products) : getHiddenProducts(products);

      setDisplayedProducts(filtered);

      if (showNotification) {
        Sonner({ message: "Data updated", sonnerState: "success" });
      }
    } catch (error) {
      console.error(error);
      Sonner({ message: "Sync error", sonnerState: "error" });
    } finally {
      // Small delay avoids immediate re-entry during unstable states
      setTimeout(() => {
        syncInProgressRef.current = false;
        setIsSyncing(false);
      }, 2000);
    }
  };

  // Heartbeat used to verify that Realtime is still delivering events
  const updateLastRealtimeEvent = () => {
    lastRealtimeEventRef.current = Date.now();
  };

  // Detects device sleep or long execution pauses
  // Forces a resync when time gaps exceed safe thresholds
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

  // Ensures state freshness when the user returns to the app
  // after a prolonged period of inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastVisibilityChangeRef.current < 60000) return;

      const sinceSync = now - lastSyncTimeRef.current;
      const sinceRealtime = now - lastRealtimeEventRef.current;

      if (sinceSync > 60000 || sinceRealtime > 120000) {
        lastVisibilityChangeRef.current = now;
        lastSyncTimeRef.current = now;
        fullResync(false);
      } else {
        lastSyncTimeRef.current = now;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // Restores consistency after network interruptions
  useEffect(() => {
    const handleOnline = () => {
      Sonner({ message: "Connection restored", sonnerState: "success" });
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
