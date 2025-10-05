import { getAllProducts } from "@/api/products";
import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import type { useSyncManagerProps } from "@/types/sync";
import { getVisibleProducts } from "@/utils/product.utils";
import { useEffect, useRef } from "react";

export function useSyncManager({ setAllProducts, setDisplayedProducts, currentView, setIsSync }: useSyncManagerProps) {
  const lastActiveTime = useRef(Date.now());
  const lastRealtimeEvent = useRef(Date.now());
  const isOnline = useRef(navigator.onLine);

  const syncData = async () => {
    try {
      setIsSync(true);
      const freshData = await getAllProducts();
      setAllProducts(freshData);
      setDisplayedProducts(
        currentView === VIEW_VISIBLEPRODUCTS
          ? getVisibleProducts(freshData)
          : freshData.filter((p) => p.isProductHidden)
      );
      lastActiveTime.current = Date.now();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSync(false);
    }
  };

  const shouldSync = () => {
    const timeAway = Date.now() - lastActiveTime.current;
    const noRealtimeEvents = Date.now() - lastRealtimeEvent.current;

    return timeAway > 60000 || noRealtimeEvents > 120000 || !isOnline.current;
  };

  const handleVisibilityChange = () => {
    if (!document.hidden && shouldSync()) {
      console.log("Document is visible, syncing data...");
      syncData();
    }
    if (!document.hidden) lastActiveTime.current = Date.now();
  };

  const handleOnlineChange = () => {
    const wasOffline = !isOnline.current;
    isOnline.current = navigator.onLine;
    console.log(`Network status changed: ${isOnline.current ? "Online" : "Offline"}`);

    if (navigator.onLine && wasOffline) {
      console.log("Back online, syncing data...");
      syncData();
    }
  };

  const updateLastRealtimeEvent = () => {
    lastRealtimeEvent.current = Date.now();
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  return { updateLastRealtimeEvent, setIsSync };
}
