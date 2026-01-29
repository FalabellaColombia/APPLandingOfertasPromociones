import { editProduct, getAllProducts, massRebalanceAndMoveProduct } from "@/api/products";
import type { Product, ProductForm, ProductToMove, ProductToMoveForm } from "@/types/product";
import { CalendarDate, parseDate } from "@internationalized/date";

const MIN_REBALANCE_VALUE = 2;

// ============================================================================
// UTILIDADES GENERALES DE PRODUCTOS
// ============================================================================

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

// ============================================================================
// UTILIDADES DE FORMULARIOS
// ============================================================================

export function getDefaultAddProductForm(maxOrderSelloutUI: number) {
  return {
    orderSellout: maxOrderSelloutUI,
    category: ["hogar", "mujer"],
    title: "ProductExample2",
    urlProduct:
      "https://www.falabella.com.co/falabella-co/category/cat6360942/Tenis?facetSelected=true&f.product.brandName=converse&f.range.derived.variant.discount=20%25+dcto+y+m%C3%A1s",
    urlImage:
      "https://www.falabella.com.co/falabella-co/category/cat6360942/Tenis?facetSelected=true&f.product.brandName=converse&f.range.derived.variant.discount=20%25+dcto+y+m%C3%A1s",
    startDate: parseDate("2025-08-14"),
    endDate: parseDate("2025-08-15"),
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

// ============================================================================
// UTILIDADES DE ORDENAMIENTO Y REORDENAMIENTO
// ============================================================================

export function getMaxOrderSelloutForUI(products: Product[]): number {
  return products.length + 1;
}

export function getProductPosition(products: Product[], productId: string): number {
  const sortedProducts = [...products].sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));
  const index = sortedProducts.findIndex((p) => p.id === productId);
  const value = index !== -1 ? index + 1 : 1;
  return value;
}

export const getReorderedPosition = (products: Product[], targetPosition: number, productToMoveId: string): number => {
  const targetIndex = targetPosition - 1;
  const otherProducts = products.filter((product) => product.id !== productToMoveId);
  const sortedProducts = otherProducts.sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));

  if (targetIndex <= 0) {
    if (sortedProducts.length === 0) {
      return 100;
    }
    const firstValue = sortedProducts[0].orderSellout || 100;
    return firstValue / 2;
  }

  if (targetIndex >= sortedProducts.length) {
    if (sortedProducts.length === 0) {
      return 100;
    }
    const lastValue = sortedProducts[sortedProducts.length - 1].orderSellout || 0;
    return lastValue + 100;
  }

  const prevProduct = sortedProducts[targetIndex - 1];
  const nextProduct = sortedProducts[targetIndex];

  const prevValue = prevProduct?.orderSellout || 0;
  const nextValue = nextProduct?.orderSellout || 0;

  return (prevValue + nextValue) / 2;
};

export const updateProductOrder = (productList: Product[], productId: string, newOrderValue: number): Product[] => {
  return productList
    .map((p) => (p.id === productId ? { ...p, orderSellout: newOrderValue } : p))
    .sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));
};

export const needsRebalancing = (products: Product[]): boolean => {
  const visibleProducts = getVisibleProducts(products).filter((p) => p.orderSellout !== null);
  if (visibleProducts.length === 0) return false;

  const minValue = Math.min(...visibleProducts.map((p) => p.orderSellout || 0));
  return minValue < MIN_REBALANCE_VALUE;
};

// ============================================================================
// VALIDACIONES
// ============================================================================

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

// ============================================================================
// UTILIDADES INTERNAS
// ============================================================================

function updateStates(
  allProducts: Product[],
  setproducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): void {
  setAllProducts(allProducts);
  setproducts(getVisibleProducts(allProducts));
}

// ============================================================================
// HANDLERS DE CAMBIO DE ORDEN
// ============================================================================

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
    const { error: rebalanceError } = await massRebalanceAndMoveProduct(productToMove.id, newOrderSellout);

    if (rebalanceError) {
      console.error("Error en rebalanceo y movimiento:", rebalanceError);
      throw new Error(`Error al mover el producto: ${rebalanceError.message || "Error desconocido"}`);
    }

    const finalProducts = await getAllProducts();
    updateStates(finalProducts, setproducts, setAllProducts);
  } catch (error) {
    console.error(error);
    throw error instanceof Error ? error : new Error("Error inesperado al rebalancear productos");
  }
}

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
