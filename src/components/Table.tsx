import { useTableConfig } from '@/hooks/useTableConfig'
import TableProductsHeader from './TableProductsHeader'
import TableProductsPagination from './TablePagination'
import TableProductsBody from './TableProductsBody'

export default function TableProducts() {
   const {
      products,
      table,
      isLoading,
      openDrawer,
      setOpenDrawer,
      activeButton,
      isFormOrderSelloutOpen,
      setPagination,
   } = useTableConfig()

   const noProducts = products.length === 0
   const noSearchFilterResults = table.getFilteredRowModel().rows.length === 0
   const hasNoResults = noProducts || noSearchFilterResults

   return (
      <div>
         <TableProductsHeader
            activeButton={activeButton}
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            isFormOrderSelloutOpen={isFormOrderSelloutOpen}
         />
         <TableProductsBody
            isLoading={isLoading}
            products={products}
            table={table}
         />

         {hasNoResults ? (
            ''
         ) : (
            <div className="mt-4">
               <TableProductsPagination
                  currentPage={table.getState().pagination.pageIndex + 1}
                  totalPages={table.getPageCount()}
                  onPageChange={(page) => {
                     setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
                  }}
                  pageSize={table.getState().pagination.pageSize}
                  onPageSizeChange={(size) => {
                     setPagination((prev) => ({
                        ...prev,
                        pageSize: size,
                        pageIndex: 0,
                     }))
                  }}
                  rowStart={
                     table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                     1
                  }
                  rowEnd={Math.min(
                     (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                     table.getFilteredRowModel().rows.length
                  )}
                  totalItems={table.getFilteredRowModel().rows.length}
               />
            </div>
         )}
      </div>
   )
}
