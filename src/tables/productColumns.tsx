import DropDownMenu from "@/components/DropDownMenu";
import ProductCategoryBadges from "@/components/ProductCategoryBadges";
import { VIEW_VISIBLEPRODUCTS, type ProductView } from "@/constants/views";
import type { Product } from "@/types/product";
import type { ColumnDef } from "@tanstack/react-table";
import { SquareArrowOutUpRight } from "lucide-react";

export const getColumns = (currentView: ProductView): ColumnDef<Product>[] => [
  {
    accessorKey: "orderSellout",
    header: "Orden Sellout",
    enableSorting: true,
    size: 120,
    cell: ({ row }) => (currentView === VIEW_VISIBLEPRODUCTS ? row.index + 1 : "-")
  },
  {
    accessorKey: "category",
    header: "Categoría",
    enableSorting: true,
    enableColumnFilter: true,
    size: 170,
    cell: ({ getValue }) => {
      const categories = getValue<string[]>();

      if (!categories || categories.length === 0 || categories.every((cat) => !cat.trim())) {
        return <span className="text-gray-400 italic pl-2">Sin categoría</span>;
      }

      return <ProductCategoryBadges categories={categories} />;
    },

    filterFn: (row, columnId, filterValue: string[]) => {
      const categories = row.getValue<string[]>(columnId);
      return categories.some((cat) => filterValue.includes(cat));
    }
  },
  {
    accessorKey: "title",
    header: "Llamado",
    enableSorting: true,
    size: 350
  },
  {
    accessorKey: "urlProduct",
    header: "URL Producto",
    size: 130,
    cell: ({ getValue }) => {
      const url = getValue<string>();
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <SquareArrowOutUpRight className="h-4 w-4" />
        </a>
      );
    }
  },
  {
    accessorKey: "urlImage",
    header: "URL Imagen",
    size: 130,
    cell: ({ getValue }) => {
      const url = getValue<string>();
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <SquareArrowOutUpRight className="h-4 w-4" />
        </a>
      );
    }
  },
  {
    accessorKey: "startDate",
    header: "Fecha Inicio",
    enableSorting: true,
    size: 130
  },
  {
    accessorKey: "endDate",
    header: "Fecha Fin",
    enableSorting: true,
    size: 130
  },
  {
    accessorKey: "offerState",
    header: "Estado Oferta",
    enableSorting: true,
    enableColumnFilter: true,
    size: 130,
    filterFn: (row, columnId, filterValue: string[]) => {
      return filterValue.includes(row.getValue(columnId));
    }
  },
  {
    id: "actions",
    size: 60,
    cell: ({ row }) => {
      return <DropDownMenu productInfo={row.original} />;
    }
  }
];
