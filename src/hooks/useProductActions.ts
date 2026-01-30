import { addProduct, deleteProduct, editProduct, getMaxOrderSellout, hideProduct, unhideProduct } from "@/api/products";
import Sonner from "@/components/Sonner";
import { VIEW_VISIBLEPRODUCTS, type ProductView } from "@/constants/views";
import type { Product, ProductForm, ProductToMove } from "@/types/product";
import {
  getChangedFields,
  getDefaultEditProductForm,
  getDefaultResetForm,
  getProductPosition
} from "@/utils/product.utils";
import { parseDate } from "@internationalized/date";
import { useState } from "react";

type UseProductActionsParams = {
  reset: (values?: ProductForm) => void;
  setFormIsDirty: (isDirty: boolean) => void;
};

/**
 * Hook that centralizes all product-related actions and UI state.
 * Handles CRUD operations, visibility, ordering (sellout),
 * and form/drawer/modal coordination.
 */
export function useProductActions({ reset, setFormIsDirty }: UseProductActionsParams) {
  // UI state
  const [isFormButtonLoading, setIsFormButtonLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormEditingOpen, setIsFormEditingOpen] = useState(false);
  const [isFormOrderSelloutOpen, setIsFormOrderSelloutOpen] = useState(false);

  // Products state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  // View state
  const [currentView, setCurrentView] = useState<ProductView>(VIEW_VISIBLEPRODUCTS);

  // Edit tracking
  const [originalProductData, setOriginalProductData] = useState<Product | null>(null);
  const [productIdToEdit, setProductIdToEdit] = useState<string | null>(null);

  // Order sellout change
  const [productToMove, setProductToMove] = useState<ProductToMove>({
    id: "",
    orderSellout: 0,
    title: ""
  });

  /**
   * Creates a new product and assigns it the last sellout position.
   */
  const handleAddProduct = async (formData: Product) => {
    setIsFormButtonLoading(true);

    try {
      const maxOrderSellout = await getMaxOrderSellout();
      const dataToSend = { ...formData, orderSellout: maxOrderSellout };

      await addProduct(dataToSend);

      setIsModalOpen(false);
      setIsDrawerOpen(false);

      Sonner({
        message: "Producto agregado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al agregar el producto",
        sonnerState: "error"
      });
    } finally {
      setIsFormButtonLoading(false);
    }
  };

  /**
   * Prepares the edit form with the selected product data.
   * Also stores the original data to later detect changes.
   */
  const handlePrepareEditForm = (product: Product) => {
    setFormIsDirty(false);
    setIsFormEditingOpen(true);
    setProductIdToEdit(product.id || null);
    setOriginalProductData(product);

    if (!product.id) return;

    const formData: ProductForm = {
      ...product,
      orderSellout: getProductPosition(displayedProducts, product.id),
      startDate: parseDate(product.startDate),
      endDate: parseDate(product.endDate)
    };

    reset(getDefaultEditProductForm(formData));
    setIsDrawerOpen(true);
  };

  /**
   * Updates a product.
   * Only changed fields are sent to the backend.
   */
  const handleEditProduct = async (formData: Product) => {
    if (!productIdToEdit || !originalProductData) {
      Sonner({
        message: "Error técnico: el producto no tiene ID. Contacta al soporte.",
        sonnerState: "error"
      });
      return;
    }

    setIsFormButtonLoading(true);

    try {
      const changedFields = getChangedFields(originalProductData, formData);

      if (Object.keys(changedFields).length === 0) {
        Sonner({
          message: "No se detectaron cambios",
          sonnerState: "warning"
        });
        return;
      }

      await editProduct(changedFields, productIdToEdit);

      Sonner({
        message: "Producto actualizado correctamente",
        sonnerState: "success"
      });

      // Reset edit state
      setIsFormEditingOpen(false);
      setIsDrawerOpen(false);
      reset(getDefaultResetForm());
      setProductIdToEdit(null);
      setOriginalProductData(null);
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Ocurrió un error al editar el producto",
        sonnerState: "error"
      });
    } finally {
      setIsFormButtonLoading(false);
    }
  };

  /**
   * Permanently deletes a product.
   */
  const handleDeleteProduct = async (productInfo: Product) => {
    const id = productInfo.id;

    if (!id) {
      Sonner({
        message: "Error técnico: el producto no tiene ID. Contacta al soporte.",
        sonnerState: "error"
      });
      return;
    }

    try {
      await deleteProduct(id);

      Sonner({
        message: "Producto eliminado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al eliminar el producto",
        sonnerState: "error"
      });
    }
  };

  /**
   * Hides a product from the visible list.
   */
  const handleHideProduct = async (product: Product) => {
    const id = product.id;

    if (!id) {
      Sonner({
        message: "Error técnico: el producto no tiene ID. Contacta al soporte.",
        sonnerState: "error"
      });
      return;
    }

    try {
      await hideProduct(id);

      Sonner({
        message: "Producto ocultado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al ocultar el producto",
        sonnerState: "error"
      });
    }
  };

  /**
   * Restores a hidden product and places it at the end of the sellout order.
   */
  const handleUnhideProduct = async (product: Product) => {
    const { id } = product;

    if (!id) {
      Sonner({
        message: "Error técnico: el producto no tiene ID. Contacta al soporte.",
        sonnerState: "error"
      });
      return;
    }

    try {
      const maxOrderSellout = await getMaxOrderSellout();
      await unhideProduct(maxOrderSellout, id);

      Sonner({
        message: "Producto desocultado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
      Sonner({
        message: "Error al desocultar el producto",
        sonnerState: "error"
      });
    }
  };

  /**
   * Prepares the form to change a product sellout order.
   */
  const handlePrepareChangeOrderSelloutForm = (productInfo: ProductToMove) => {
    setFormIsDirty(false);

    if (!productInfo.id) return;

    const orderSelloutForUI = getProductPosition(displayedProducts, productInfo.id);

    setIsDrawerOpen(true);
    setIsFormOrderSelloutOpen(true);
    setProductToMove({
      id: productInfo.id,
      orderSellout: orderSelloutForUI,
      title: productInfo.title
    });
  };

  return {
    // General state
    isFormButtonLoading,
    isModalOpen,
    setIsModalOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    currentView,
    setCurrentView,

    // Products
    allProducts,
    setAllProducts,
    displayedProducts,
    setDisplayedProducts,
    productToMove,

    // Edition
    isFormEditingOpen,
    setIsFormEditingOpen,
    isFormOrderSelloutOpen,
    setIsFormOrderSelloutOpen,

    // Actions
    handleAddProduct,
    handleEditProduct,
    handlePrepareEditForm,
    handleDeleteProduct,
    handleHideProduct,
    handleUnhideProduct,
    handlePrepareChangeOrderSelloutForm
  };
}
