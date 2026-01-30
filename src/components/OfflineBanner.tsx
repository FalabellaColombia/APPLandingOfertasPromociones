import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="relative">
      <div className="h-10" />

      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-950 border-t border-b border-amber-600 text-white p-2 text-center text-sm font-medium flex items-center justify-center gap-3">
        <TriangleAlert size={17} />
        Sin conexión a internet. Los cambios se sincronizarán automáticamente al reconectar.
      </div>
    </div>
  );
}
