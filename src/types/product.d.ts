import type { productFormSchema, productToMoveFormSchema } from "@/lib/schemas/product.schema";
import type { z } from "zod";

export type Product = {
  id?: string;
  orderSellout: number;
  category: string[];
  title: string;
  urlProduct: string;
  urlImage: string;
  startDate: string;
  endDate: string;
  offerState: string | null;
  isProductHidden: boolean;
};

export type ProductToMove = {
  id?: string;
  orderSellout: number;
  title: string;
};

// Types derived from Zod schemas (linked to runtime validations)
export type ProductForm = z.infer<typeof productFormSchema>;
export type ProductToMoveForm = z.infer<typeof productToMoveFormSchema>;
