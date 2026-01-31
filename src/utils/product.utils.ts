import { editProduct, getAllProducts, massRebalanceAndMoveProduct } from "@/api/products";
import type { Product, ProductForm, ProductToMove, ProductToMoveForm } from "@/types/product";
import { CalendarDate } from "@internationalized/date";

// Minimum order value threshold that triggers a full server-side rebalance.
// Repeated averaging during reordering can shrink values below this limit.
const MIN_REBALANCE_VALUE = 2;

// -----------------------------------------------------------------------------
// Product utilities
// -----------------------------------------------------------------------------

export function getVisibleProducts(products: Product[]) {
  return products.filter((p) => !p.isProductHidden);
}

export function getHiddenProducts(products: Product[]) {
  return products.filter((p) => p.isProductHidden);
}

export function formatProductDates(formData: ProductForm) {
  return {
    ...formData,
    startDate: formData.startDate.toString(),
    endDate: formData.endDate.toString()
  };
}

// -----------------------------------------------------------------------------
// Form helpers
// -----------------------------------------------------------------------------

export function getDefaultAddProductForm(maxOrderSelloutUI: number) {
  return {
    orderSellout: maxOrderSelloutUI,
    category: [],
    title: "",
    urlProduct: "",
    urlImage: "",
    startDate: undefined,
    endDate: undefined,
    offerState: null,
    isProductHidden: false
  };
}

export function getDefaultResetForm() {
  return {
    orderSellout: 0,
    category: [] as string[],
    title: "",
    urlProduct: "",
    urlImage: "",
    startDate: null as unknown as CalendarDate,
    endDate: null as unknown as CalendarDate,
    offerState: null,
    isProductHidden: false
  };
}

export function getDefaultEditProductForm(product: ProductForm) {
  return {
    orderSellout: product.orderSellout || 0,
    category: product.category?.filter((cat) => cat.trim()) || [],
    title: product.title || "",
    urlProduct: product.urlProduct || "",
    urlImage: product.urlImage || "",
    startDate: product.startDate,
    endDate: product.endDate,
    offerState: product.offerState || "",
    isProductHidden: product.isProductHidden ?? false
  };
}

export function getChangedFields<T extends Record<string, unknown>>(originalData: T, newData: T): Partial<T> {
  const changedFields: Partial<T> = {};

  for (const key in newData) {
    if (key === "orderSellout" || key === "id") continue;
    if (originalData[key] !== newData[key]) {
      changedFields[key] = newData[key];
    }
  }

  return changedFields;
}

// -----------------------------------------------------------------------------
// Ordering logic
// -----------------------------------------------------------------------------

export function getMaxOrderSelloutForUI(products: Product[]): number {
  return products.length + 1;
}

export function getProductPosition(products: Product[], productId: string): number {
  const sortedProducts = [...products].sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));
  const index = sortedProducts.findIndex((p) => p.id === productId);
  return index !== -1 ? index + 1 : 1;
}

// Calculates a new order value by averaging neighboring positions.
// This allows lightweight reordering without triggering a full rebalance.
export const getReorderedPosition = (products: Product[], targetPosition: number, productToMoveId: string): number => {
  const targetIndex = targetPosition - 1;
  const otherProducts = products.filter((product) => product.id !== productToMoveId);
  const sortedProducts = otherProducts.sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));

  if (targetIndex <= 0) {
    if (sortedProducts.length === 0) return 100;
    const firstValue = sortedProducts[0].orderSellout || 100;
    return firstValue / 2;
  }

  if (targetIndex >= sortedProducts.length) {
    if (sortedProducts.length === 0) return 100;
    const lastValue = sortedProducts[sortedProducts.length - 1].orderSellout || 0;
    return lastValue + 100;
  }

  const prevValue = sortedProducts[targetIndex - 1]?.orderSellout || 0;
  const nextValue = sortedProducts[targetIndex]?.orderSellout || 0;

  return (prevValue + nextValue) / 2;
};

export const updateProductOrder = (productList: Product[], productId: string, newOrderValue: number): Product[] => {
  return productList
    .map((p) => (p.id === productId ? { ...p, orderSellout: newOrderValue } : p))
    .sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));
};

// Determines when lightweight averaging is no longer safe
// and a full server-side rebalance is required.
export const needsRebalancing = (products: Product[]): boolean => {
  const visibleProducts = getVisibleProducts(products).filter((p) => p.orderSellout !== null);
  if (visibleProducts.length === 0) return false;

  const minValue = Math.min(...visibleProducts.map((p) => p.orderSellout || 0));
  return minValue < MIN_REBALANCE_VALUE;
};

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function validateOrderSelloutInput(
  newOrderSellout: number,
  currentOrderSellout: number,
  maxOrder: number
): string | null {
  if (newOrderSellout < 1 || newOrderSellout > maxOrder) {
    return `El orden debe estar entre 1 y ${maxOrder}`;
  }

  if (newOrderSellout === currentOrderSellout) {
    return "El nuevo orden no puede ser igual al actual";
  }

  return null;
}

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

function updateStates(
  allProducts: Product[],
  setproducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): void {
  setAllProducts(allProducts);
  setproducts(getVisibleProducts(allProducts));
}

// -----------------------------------------------------------------------------
// Order change handlers
// -----------------------------------------------------------------------------

// Uses a server-side RPC to normalize ordering when local reordering
// becomes unstable due to repeated averaging or concurrent edits.
export async function handleMassOrderChange(
  newOrderSellout: number,
  productToMove: ProductToMove,
  setproducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> {
  if (!productToMove.id) {
    throw new Error("Error técnico: el producto no tiene ID. Contacta al soporte.");
  }

  try {
    const { error } = await massRebalanceAndMoveProduct(productToMove.id, newOrderSellout);
    if (error) {
      throw new Error(error.message || "Rebalance error");
    }

    const finalProducts = await getAllProducts();
    updateStates(finalProducts, setproducts, setAllProducts);
  } catch (error) {
    console.error(error);
    throw error instanceof Error ? error : new Error("Unexpected rebalance error");
  }
}

// Performs a lightweight reorder using averaged order values.
// This avoids a full rebalance when the ordering space is still safe.
export async function handleSingleOrderChange(
  productToMoveId: string,
  products: Product[],
  formData: ProductToMoveForm,
  setproducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> {
  const newOrderValue = getReorderedPosition(products, formData.neworderSellout, productToMoveId);

  await editProduct({ orderSellout: newOrderValue }, productToMoveId);

  setAllProducts((prev) => updateProductOrder(prev, productToMoveId, newOrderValue));
  setproducts((prev) => updateProductOrder(prev, productToMoveId, newOrderValue));
}
