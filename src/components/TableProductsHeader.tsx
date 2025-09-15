import { VIEW_LISTADO } from "@/constants/views";
import { useFilters } from "@/hooks/useFilters";
import { useProducts } from "@/hooks/useProducts";
import { useTableConfig } from "@/hooks/useTableConfig";
import type { TableHeader } from "@/types/table";
import { getDefaultAddProductForm, getMaxOrderSelloutForUI } from "@/utils/product.utils";
import type { ColumnFilter, ColumnFiltersState } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import CategoryBadges from "./CategoryBadges'";
import { Drawer } from "./Drawer";
import FilterCategoryButton from "./FilterCategoryButton";
import Form from "./Form";
import FormMoveProduct from "./FormMoveProduct";
import Search from "./Search";
import { Button } from "./ui/button";

export default function TableProductsHeader({ activeButton, isFormOrderSelloutOpen }: TableHeader) {
  const { products, reset, setFormEditingIsOpen, setOpenDrawer, openDrawer } = useProducts();
  const { columnFilters, setColumnFilters } = useFilters();
  const { setPagination } = useTableConfig();

  const handlePrepareAddProductForm = () => {
    const maxOrderSelloutUI = getMaxOrderSelloutForUI(products);
    
    reset(getDefaultAddProductForm(maxOrderSelloutUI));
    setOpenDrawer(true);
    setFormEditingIsOpen(false);
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
              variant="secondary"
              onClick={() => setColumnFilters((prev: ColumnFiltersState) => prev.filter((f) => f.id !== "title"))}
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="flex gap-2 m-0">
          {activeButton === VIEW_LISTADO && (
            <Button className="aspect-square max-sm:p-0 m-0" onClick={handlePrepareAddProductForm}>
              <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">Agregar Producto</span>
            </Button>
          )}

          <FilterCategoryButton />
        </div>

        <Drawer isOpen={openDrawer} onClose={() => setOpenDrawer(false)}>
          {isFormOrderSelloutOpen ? <FormMoveProduct /> : <Form />}
        </Drawer>
      </div>

      <CategoryBadges />
    </>
  );
}
