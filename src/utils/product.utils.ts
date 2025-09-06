import { editProduct, getAllProducts } from "@/api/products";
import type { Product, ProductForm, ProductToMove, ProductToMoveForm } from "@/types/product";
import { CalendarDate, parseDate } from "@internationalized/date";
import { formatDateToISO } from "./formatDate";
import supabase from "./supabase";

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

export function formatProductDates(formData: ProductForm, isEdit = false) {
  if (!formData.orderSellout) {
    throw new Error("El producto debe tener un ID para poder moverlo");
  }

  return {
    ...formData,
    orderSellout: isEdit ? formData.orderSellout * 100 : formData.orderSellout,
    startDate: formatDateToISO(formData.startDate),
    endDate: formatDateToISO(formData.endDate)
  };
}

export function getNextorderSellout(products: Product[]): number {
  if (products.length === 0) return 1;

  const max = Math.max(...products.map((p) => Number(p.orderSellout) || 0));
  const visual = Math.floor(max / 100);

  return visual + 1;
}

export function updateAllProducts(products: Product[], idProduct: string, product: Product): Product[] {
  return products.map((p) => (p.id === idProduct ? product : p));
}

export function moveProductToEnd(products: Product[], idProduct: string, updatedProduct: Product): Product[] {
  const filtered = products.filter((p) => p.id !== idProduct);
  return [...filtered, updatedProduct];
}

// ============================================================================
// UTILIDADES DE FORMULARIOS
// ============================================================================

export function getDefaultAddProductForm(nextorderSellout: number) {
  return {
    orderSellout: String(nextorderSellout),
    category: "Hogar",
    title: "asdasdsa",
    urlProduct:
      "https://www.falabella.com.co/falabella-co/category/cat6360942/Tenis?facetSelected=true&f.product.brandName=converse&f.range.derived.variant.discount=20%25+dcto+y+m%C3%A1s",
    urlImage:
      "https://www.falabella.com.co/falabella-co/category/cat6360942/Tenis?facetSelected=true&f.product.brandName=converse&f.range.derived.variant.discount=20%25+dcto+y+m%C3%A1s",
    startDate: new CalendarDate(2025, 8, 1),
    endDate: new CalendarDate(2025, 8, 31),
    offerState: "",
    isProductHidden: false
  };
}

export function getDefaultResetForm() {
  return {
    orderSellout: 0,
    category: "",
    title: "",
    urlProduct: "",
    urlImage: "",
    startDate: undefined,
    endDate: undefined,
    offerState: "",
    isProductHidden: false
  };
}

export function getDefaultEditProductForm(product: Product) {
  return {
    orderSellout: product.orderSellout ? (product.orderSellout / 100).toString() : "",
    category: product.category,
    title: product.title,
    urlProduct: product.urlProduct,
    urlImage: product.urlImage,
    startDate: product.startDate ? parseDate(product.startDate) : undefined,
    endDate: product.endDate ? parseDate(product.endDate) : undefined,
    offerState: product.offerState,
    isProductHidden: product.isProductHidden ?? false
  };
}

// ============================================================================
// UTILIDADES DE ORDENAMIENTO Y REORDENAMIENTO
// ============================================================================

export const adjustOrderSellout = (products: Product[], targetPosition: string, productToMoveId: string): number => {
  const targetIndex = Number(targetPosition) - 1;

  const availableProducts = products.filter((product) => product.id !== productToMoveId);

  const sortedProducts = availableProducts.sort((a, b) => (a.orderSellout || 0) - (b.orderSellout || 0));

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

export function reorderOrderSellout(products: Product[]): Product[] {
  return products.sort((a, b) => a.orderSellout - b.orderSellout).map((p, i) => ({ ...p, orderSellout: i + 1 }));
}

export function updateVisibleOrderInAllProducts(allProducts: Product[], orderedVisibleProducts: Product[]): Product[] {
  const visibleIds = new Set(orderedVisibleProducts.map((p) => p.id));
  return allProducts.map((product) => {
    if (visibleIds.has(product.id)) {
      const updated = orderedVisibleProducts.find((p) => p.id === product.id);
      return updated ?? product;
    }
    return product;
  });
}

export const needsRebalancing = (products: Product[]): boolean => {
  const visibleProducts = getVisibleProducts(products).filter((p) => p.orderSellout !== null);
  if (visibleProducts.length === 0) return false;

  const minValue = Math.min(...visibleProducts.map((p) => p.orderSellout || 0));
  return minValue < MIN_REBALANCE_VALUE;
};

// ============================================================================
// VALIDACIONES
// ============================================================================

export function validateOrderChange(
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
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): void {
  setAllProducts(allProducts);
  setProducts(getVisibleProducts(allProducts));
}

// ============================================================================
// HANDLERS DE CAMBIO DE ORDEN
// ============================================================================

export async function handleMassiveOrderChange(
  newOrderSellout: number,
  productToMove: ProductToMove,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> {
  if (!productToMove.id) {
    throw new Error("El producto debe tener un ID para poder moverlo");
  }

  try {
    const currentProducts = await getAllProducts();
    const visibleProducts = getVisibleProducts(currentProducts);
    const newOrderValue = adjustOrderSellout(visibleProducts, newOrderSellout.toString(), productToMove.id);

    await editProduct({ orderSellout: newOrderValue }, productToMove.id);

    const { error: rebalanceError } = await supabase.rpc("mass_rebalance_products");
    if (rebalanceError) throw rebalanceError;

    const finalProducts = await getAllProducts();
    updateStates(finalProducts, setProducts, setAllProducts);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function handleSimpleOrderChange(
  productToMoveId: string,
  products: Product[],
  formData: ProductToMoveForm,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
): Promise<void> {
  const newOrderValue = adjustOrderSellout(products, String(formData.neworderSellout), productToMoveId);

  await editProduct({ orderSellout: newOrderValue }, productToMoveId);

  setAllProducts((prev) => updateProductOrder(prev, productToMoveId, newOrderValue));
  setProducts((prev) => updateProductOrder(prev, productToMoveId, newOrderValue));
}
