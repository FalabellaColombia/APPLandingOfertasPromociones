import { TABLE_NAME } from "@/constants/tableName";
import type { Product, ProductForm } from "@/types/product";
import supabase from "@/utils/supabase";

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("orderSellout", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addProduct(product: ProductForm) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function editProduct(
  dataToUpdate: Partial<ProductForm>,
  editingProductId: string | null
): Promise<Product[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(dataToUpdate)
    .eq("id", editingProductId)
    .select();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
}

export async function hideProduct(id: string) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      isProductHidden: true,
      orderSellout: null,
    })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function unhideProduct(
  maxOrderSellout: number,
  id: string
): Promise<Product> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      isProductHidden: false,
      orderSellout: maxOrderSellout + 1,
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function upsertProducts(products: Product[]) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(products, { onConflict: "id" });
  if (error) throw error;
}

export async function getMaxOrderSellout(): Promise<number> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("orderSellout")
    .not("isProductHidden", "eq", true)
    .order("orderSellout", { ascending: false })
    .limit(1);

  if (error) throw error;

  const maxOrder = data?.[0]?.orderSellout ?? 0;
  return maxOrder + 100;
}
