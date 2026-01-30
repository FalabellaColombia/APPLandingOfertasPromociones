import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CATEGORIES } from "@/constants/product";

type ProductCategoryBadgesProps = {
  categories: string[];
};

const getCategoryLabel = (value: string) => CATEGORIES.find((c) => c.value === value)?.label ?? value;

export default function ProductCategoryBadges({ categories }: ProductCategoryBadgesProps) {
  const MAX_VISIBLE = 2;
  const visible = categories.slice(0, MAX_VISIBLE);
  const hidden = categories.slice(MAX_VISIBLE);

  return (
    <div className="flex gap-1 flex-wrap">
      {visible.map((value) => (
        <Badge key={value} variant="outline">
          {getCategoryLabel(value)}
        </Badge>
      ))}

      {hidden.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline">+{hidden.length}</Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex flex-col gap-1">
                {hidden.map((value) => (
                  <span key={value}>{getCategoryLabel(value)}</span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
