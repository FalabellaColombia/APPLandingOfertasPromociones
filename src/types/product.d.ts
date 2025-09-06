import type { productFormSchema, productToMoveSchema } from "@/lib/schemas/product.schema";
import type { z } from "zod";

// Tipos estáticos
export type Product = {
  id?: string;
  orderSellout: number;
  category: string;
  title: string;
  urlProduct: string;
  urlImage: string;
  startDate: string;
  endDate: string;
  offerState: string;
  isProductHidden: boolean;
};

export type ProductToMove = {
  id?: string;
  orderSellout: string;
  title: string;
};

// Tipos derivados de los schemas de Zod (ligados a validaciones en tiempo de ejecución)
export type ProductForm = z.infer<typeof productFormSchema>;
export type ProductToMoveForm = z.infer<typeof productToMoveSchema>;
