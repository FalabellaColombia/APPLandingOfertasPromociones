import { Badge } from "@/components/ui/badge";
import { useFilters } from "@/hooks/useFilters";
import { XIcon } from "lucide-react";

type CategoryFilterBadgeProps = {
  value: string;
  label: string;
};

export default function CategoryFilterBadge({ value, label }: CategoryFilterBadgeProps) {
  const { selectedCategories, toggleCategory } = useFilters();

  if (!selectedCategories.includes(value)) return null;

  return (
    <Badge className="gap-0 rounded-md">
      {label}
      <button
        onClick={() => toggleCategory(value)}
        className="focus-visible:border-ring focus-visible:ring-ring/50 text-primary-foreground/60 hover:text-primary-foreground -my-px -ms-px -me-1.5 inline-flex size-5 items-center justify-center"
      >
        <XIcon size={12} className="cursor-pointer" />
      </button>
    </Badge>
  );
}
