import { useTableConfig } from "@/hooks/useTableConfig";
import TableProductsPagination from "./TablePagination";
import TableProductsBody from "./TableProductsBody";
import TableProductsHeader from "./TableProductsHeader";

export default function TableProducts() {
  const {
    displayedProducts,
    table,
    isLoading,
    isDrawerOpen,
    setIsDrawerOpen,
    currentView,
    isFormOrderSelloutOpen,
    setPagination
  } = useTableConfig();

  const noProducts = displayedProducts.length === 0;
  const noSearchFilterResults = table.getFilteredRowModel().rows.length === 0;
  const hasNoResults = noProducts || noSearchFilterResults;

  return (
    <div>
      <TableProductsHeader
        currentView={currentView}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        isFormOrderSelloutOpen={isFormOrderSelloutOpen}
      />
      <TableProductsBody isLoading={isLoading} displayedProducts={displayedProducts} table={table} />

      {hasNoResults ? (
        ""
      ) : (
        <div className="mt-4">
          <TableProductsPagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(page) => {
              setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
            }}
            pageSize={table.getState().pagination.pageSize}
            onPageSizeChange={(size) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: size,
                pageIndex: 0
              }));
            }}
            rowStart={table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            rowEnd={Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
            totalItems={table.getFilteredRowModel().rows.length}
          />
        </div>
      )}
    </div>
  );
}
