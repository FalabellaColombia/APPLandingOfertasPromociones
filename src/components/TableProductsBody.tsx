import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableProductsBody } from "@/types/table";
import { flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Loader } from "./Loader";

export default function TableProductsBody({ isLoading, displayedProducts, table }: TableProductsBody) {
  const noProducts = displayedProducts.length === 0;
  const noSearchFilterResults = table.getFilteredRowModel().rows.length === 0;
  const hasNoResults = noProducts || noSearchFilterResults;

  return (
    <div className="bg-background overflow-hidden rounded-md border mt-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler?.()}
                  className="h-10 pl-1 cursor-pointer select-none"
                  style={{ width: header.getSize() }}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />,
                      desc: <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllColumns().length} className="py-5 text-center">
                <Loader />
              </TableCell>
            </TableRow>
          ) : hasNoResults ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllColumns().length} className="py-8">
                <p className="w-full grow text-sm text-center">No se encontraron productos</p>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-xs pl-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
