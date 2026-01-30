import { TABLE_NAME } from "@/constants/tableName";
import type { Product } from "@/types/product";
import supabase from "@/utils/supabase";

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from(TABLE_NAME).select("*").order("orderSellout", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addProduct(product: Product) {
  const { data, error } = await supabase.from(TABLE_NAME).insert([product]).select().single();
  if (error) throw error;
  return data;
}

export async function editProduct(dataToUpdate: Partial<Product>, editingProductId: string): Promise<Product[]> {
  const { data, error } = await supabase.from(TABLE_NAME).update(dataToUpdate).eq("id", editingProductId).select();
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
      orderSellout: null
    })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function unhideProduct(maxOrderSellout: number, id: string): Promise<Product> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      isProductHidden: false,
      orderSellout: maxOrderSellout
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
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

// Performs a server-side mass reordering via Supabase RPC.
// Used when repeated reorders shrink order values below 2.
// Normalizes visible products back to spaced integer positions
// (e.g. 100, 200, 300) to keep ordering stable in realtime usage.
export async function massRebalanceAndMoveProduct(productId: string, targetPosition: number) {
  return await supabase.rpc("mass_rebalance_and_move_product", {
    product_id_to_move: productId,
    target_position: targetPosition
  });
}
