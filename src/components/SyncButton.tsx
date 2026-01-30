import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProducts } from "@/hooks/useProducts";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function SyncButton() {
  const { forceResync, isSyncing } = useProducts();
  const throttleRef = useRef(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (isThrottled || throttleRef.current || isSyncing) return;
    if (!isOnline) return;

    throttleRef.current = true;
    setIsThrottled(true);

    await forceResync();

    setTimeout(() => {
      throttleRef.current = false;
      setIsThrottled(false);
    }, 4000);
  };

  const isDisabled = isThrottled || isSyncing || !isOnline;

  const getTooltipText = () => {
    if (!isOnline) return "Sin conexión a internet";
    if (isSyncing) return "Sincronizando...";
    if (isThrottled) return "Sincronización en espera";
    return "Forzar sincronización";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              onClick={handleSync}
              variant="outline"
              size="icon"
              disabled={isDisabled}
              className={`size-9 hover:!bg-muted cursor-pointer transition-colors ${
                isDisabled ? "text-muted-foreground cursor-not-allowed" : ""
              }`}
            >
              {isSyncing ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCcw aria-hidden="true" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">{getTooltipText()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SyncButton;
