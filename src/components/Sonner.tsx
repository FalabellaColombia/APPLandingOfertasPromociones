import { Button } from "@/components/ui/button";
import { CircleCheckIcon, CircleX, Info, TriangleAlert, XIcon } from "lucide-react";
import { toast } from "sonner";

type SonnerConfig = {
  message: string;
  description?: string;
  sonnerState: "success" | "warning" | "error" | "info";
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
};

const colorMap = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-blue-400"
};

const iconMap = {
  success: CircleCheckIcon,
  warning: TriangleAlert,
  error: CircleX,
  info: Info
};

export default function Sonner({ message, description, position, sonnerState }: SonnerConfig) {
  const Icon = iconMap[sonnerState];

  return toast.custom(
    (t) => (
      <div className="bg-background text-foreground w-full rounded-md border px-4 py-3 shadow-lg sm:w-[var(--width)]">
        <div className="flex gap-2">
          <div className="flex grow gap-3">
            <Icon className={`mt-0.5 shrink-0 ${colorMap[sonnerState]}`} size={16} aria-hidden="true" />
            <div className="flex grow justify-between">
              <div>
                <p className="text-sm">{message}</p>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
            onClick={() => toast.dismiss(t)}
            aria-label="Cerrar notificación"
          >
            <XIcon size={16} className="opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </Button>
        </div>
      </div>
    ),
    { position }
  );
}
