import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CATEGORIES } from "@/constants/product";
import { useFilters } from "@/hooks/useFilters";
import { ListFilter } from "lucide-react";

export default function CategoryFilterDropdown() {
  const { selectedCategories, toggleCategory } = useFilters();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hover:!bg-muted">
          <ListFilter size={16} />
          Filtrar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {CATEGORIES.map(({ value, label }) => (
          <DropdownMenuCheckboxItem
            key={label}
            checked={selectedCategories.includes(value)}
            onCheckedChange={() => toggleCategory(value)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
