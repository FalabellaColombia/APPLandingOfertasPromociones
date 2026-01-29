import { Button } from "@/components/ui/button";
import { VIEW_HIDDENPRODUCTS, VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import { EyeOff, Package, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  [VIEW_VISIBLEPRODUCTS]: Package,
  [VIEW_HIDDENPRODUCTS]: EyeOff
};

type ButtonProps = {
  text: string;
  functionOnClick: () => void;
  isActive: boolean;
};

export default function MenuButton({ text, functionOnClick, isActive }: ButtonProps) {
  const Icon = iconMap[text];
  return (
    <Button
      className={`group ${isActive ? "" : "text-muted-foreground"} cursor-pointer`}
      variant="outline"
      onClick={functionOnClick}
    >
      {Icon && <Icon className="-ms-1 opacity-60 transition-transform " size={16} aria-hidden="true" />}
      {text}
    </Button>
  );
}
