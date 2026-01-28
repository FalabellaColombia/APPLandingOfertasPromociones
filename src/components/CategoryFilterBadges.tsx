import { CATEGORIES } from "@/constants/product";
import { useFilters } from "@/hooks/useFilters";
import CategoryFilterBadge from "./CategoryFilterBadge";

const getCategoryLabel = (value: string) => CATEGORIES.find((c) => c.value === value)?.label ?? value;

export default function CategoryCategoryFilterBadges() {
  const { columnFilters } = useFilters();

  const categoryFilter = columnFilters.find((f) => f.id === "category");
  const activeCategoryValues = Array.isArray(categoryFilter?.value) ? categoryFilter.value : [];

  return (
    <div className="flex space-x-1.5 my-3">
      {activeCategoryValues.map((value) => (
        <CategoryFilterBadge key={value} value={value} label={getCategoryLabel(value)} />
      ))}
    </div>
  );
}
