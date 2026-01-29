import { VIEW_VISIBLEPRODUCTS } from "@/constants/views";
import { useFilters } from "@/hooks/useFilters";
import { useProducts } from "@/hooks/useProducts";
import { useTableConfig } from "@/hooks/useTableConfig";
import type { TableHeader } from "@/types/table";
import { getDefaultAddProductForm, getMaxOrderSelloutForUI } from "@/utils/product.utils";
import type { ColumnFilter, ColumnFiltersState } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import CategoryCategoryFilterBadges from "./CategoryFilterBadges";
import CategoryFilterDropdown from "./CategoryFilterDropdown";
import { Drawer } from "./Drawer";
import Form from "./Form";
import FormMoveProduct from "./FormMoveProduct";
import Search from "./Search";
import { Button } from "./ui/button";

export default function TableProductsHeader({ currentView, isFormOrderSelloutOpen }: TableHeader) {
  const { displayedProducts, reset, setIsFormEditingOpen, setIsDrawerOpen, isDrawerOpen } = useProducts();
  const { columnFilters, setColumnFilters } = useFilters();
  const { setPagination } = useTableConfig();

  const handlePrepareAddProductForm = () => {
    const maxOrderSelloutUI = getMaxOrderSelloutForUI(displayedProducts);

    reset(getDefaultAddProductForm(maxOrderSelloutUI));
    setIsDrawerOpen(true);
    setIsFormEditingOpen(false);
  };

  const searchValue = (columnFilters.find((f: ColumnFilter) => f.id === "title")?.value as string) ?? "";

  return (
    <>
      <div className="flex justify-between space-x-4 mb-2">
        <div className="flex space-x-2.5">
          <Search
            value={searchValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));

              setColumnFilters((prev: ColumnFiltersState) => {
                const withoutTitle = prev.filter((f) => f.id !== "title");
                return newValue ? [...withoutTitle, { id: "title", value: newValue }] : withoutTitle;
              });
            }}
          />
          {searchValue !== "" && (
            <Button
              className="cursor-pointer"
              variant="secondary"
              onClick={() => setColumnFilters((prev: ColumnFiltersState) => prev.filter((f) => f.id !== "title"))}
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="flex gap-2 m-0">
          {currentView === VIEW_VISIBLEPRODUCTS && (
            <Button className="aspect-square max-sm:p-0 m-0 cursor-pointer" onClick={handlePrepareAddProductForm}>
              <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">Agregar Producto</span>
            </Button>
          )}

          <CategoryFilterDropdown />
        </div>

        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          {isFormOrderSelloutOpen ? <FormMoveProduct /> : <Form />}
        </Drawer>
      </div>

      <CategoryCategoryFilterBadges />
    </>
  );
}
