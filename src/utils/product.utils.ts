import type { Product, ProductForm } from "@/types/product";
import { formatDateToISO } from "./formatDate";
import { parseDate } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";

export function getVisibleProducts(products: Product[]) {
  return products.filter((p) => !p.isProductHidden);
}

export function getHiddenProducts(products: Product[]) {
  return products.filter((p) => p.isProductHidden);
}

export function formatProductDates(formData: ProductForm, isEdit = false) {
  return {
    ...formData,
    orderSellout: isEdit
      ? parseInt(formData.orderSellout) * 100
      : parseInt(formData.orderSellout),
    startDate: formatDateToISO(formData.startDate),
    endDate: formatDateToISO(formData.endDate),
  };
}

export function getNextorderSellout(products: Product[]): number {
  if (products.length === 0) return 1;

  const max = Math.max(...products.map((p) => Number(p.orderSellout) || 0));
  const visual = Math.floor(max / 100);

  return visual + 1;
}

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
    isProductHidden: false,
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
    isProductHidden: false,
  };
}

export function getDefaultEditProductForm(product: Product) {
  return {
    orderSellout: product.orderSellout
      ? (product.orderSellout / 100).toString()
      : "",
    category: product.category,
    title: product.title,
    urlProduct: product.urlProduct,
    urlImage: product.urlImage,
    startDate: product.startDate ? parseDate(product.startDate) : undefined,
    endDate: product.endDate ? parseDate(product.endDate) : undefined,
    offerState: product.offerState,
    isProductHidden: product.isProductHidden ?? false,
  };
}

export function reorderOrderSellout(products: Product[]): Product[] {
  return products
    .sort((a, b) => a.orderSellout - b.orderSellout)
    .map((p, i) => ({ ...p, orderSellout: i + 1 }));
}

export function updateAllProducts(
  products: Product[],
  idProduct: string,
  product: Product
): Product[] {
  return products.map((p) => (p.id === idProduct ? product : p));
}

export function moveProductToEnd(
  products: Product[],
  idProduct: string,
  updatedProduct: Product
): Product[] {
  const filtered = products.filter((p) => p.id !== idProduct);
  return [...filtered, updatedProduct];
}

export const adjustOrderSellout = (
  products: Product[],
  targetId: string,
  oldOrder: number,
  newOrder: number
): Product[] => {
  const movingUp = newOrder < oldOrder;

  return products.map((p) => {
    if (p.id === targetId) {
      return { ...p, orderSellout: newOrder };
    }

    if (movingUp && p.orderSellout >= newOrder && p.orderSellout < oldOrder) {
      return { ...p, orderSellout: p.orderSellout + 1 };
    }

    if (!movingUp && p.orderSellout > oldOrder && p.orderSellout <= newOrder) {
      return { ...p, orderSellout: p.orderSellout - 1 };
    }

    return p;
  });
};

export function updateVisibleOrderInAllProducts(
  allProducts: Product[],
  orderedVisibleProducts: Product[]
): Product[] {
  const visibleIds = new Set(orderedVisibleProducts.map((p) => p.id));
  return allProducts.map((product) => {
    if (visibleIds.has(product.id)) {
      const updated = orderedVisibleProducts.find((p) => p.id === product.id);
      return updated ?? product;
    }
    return product;
  });
}
