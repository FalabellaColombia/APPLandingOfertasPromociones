import { addProduct, deleteProduct, editProduct, getMaxOrderSellout, hideProduct, unhideProduct } from "@/api/products";
import Sonner from "@/components/Sonner";
import { VIEW_VISIBLEPRODUCTS, type ProductView } from "@/constants/views";
import type { Product, ProductForm, ProductToMove } from "@/types/product";
import {
  getChangedFields,
  getDefaultEditProductForm,
  getDefaultResetForm,
  getProductPosition,
  getVisibleProducts
} from "@/utils/product.utils";
import { parseDate } from "@internationalized/date";
import { useState } from "react";
import { useProductForm } from "./useProductForm";

export function useProductActions() {
  const { reset } = useProductForm();
  const [isFormButtonLoading, setIsFormButtonLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormEditingOpen, setIsFormEditingOpen] = useState(false);
  const [isFormOrderSelloutOpen, setIsFormOrderSelloutOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [currentView, setCurrentView] = useState<ProductView>(VIEW_VISIBLEPRODUCTS);
  const [originalProductData, setOriginalProductData] = useState<Product | null>(null);
  const [productIdToEdit, setProductIdToEdit] = useState<string | null>(null);
  const [productToMove, setProductToMove] = useState<ProductToMove>({
    id: "",
    orderSellout: 0,
    title: ""
  });

  const handleAddProduct = async (formData: Product) => {
    setIsFormButtonLoading(true);

    try {
      const maxOrderSellout = await getMaxOrderSellout();
      const dataToSend = { ...formData, orderSellout: maxOrderSellout };
      const addedProduct = await addProduct(dataToSend);

      setAllProducts((prevProducts) => [...prevProducts, addedProduct]);
      setDisplayedProducts((prevProducts) => [...prevProducts, addedProduct]);

      setIsModalOpen(false);
      setIsDrawerOpen(false);

      Sonner({
        message: "Producto agregado correctamente",
        sonnerState: "success"
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsFormButtonLoading(false);
    }
  };

  const handlePrepareEditForm = (product: Product) => {
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
        setIsFormButtonLoading(false);
        return;
      }
      const productUpdated = await editProduct(changedFields, productIdToEdit);
      if (productUpdated) {
        Sonner({
          message: "Producto actualizado correctamente",
          sonnerState: "success"
        });

        setAllProducts((prev) => prev.map((p) => (p.id === productIdToEdit ? productUpdated[0] : p)));
        setDisplayedProducts((prev) => prev.map((p) => (p.id === productIdToEdit ? productUpdated[0] : p)));

        setIsFormEditingOpen(false);
        setIsDrawerOpen(false);
        reset(getDefaultResetForm());
        setProductIdToEdit(null);
        setOriginalProductData(null);
      }
    } catch (error) {
      Sonner({
        message: "Ocurrió un error al editar el producto",
        sonnerState: "error"
      });
      console.error(error);
    } finally {
      setIsFormButtonLoading(false);
    }
  };

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
      const updatedAllProducts = allProducts.filter((p) => p.id !== id);
      setAllProducts(updatedAllProducts);

      const updatedProducts = displayedProducts.filter((p) => p.id !== id);
      setDisplayedProducts(updatedProducts);

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
      const hiddenProduct = await hideProduct(id);
      const updatedList = allProducts.map((p) => (p.id === id ? hiddenProduct : p));
      const visibleProducts = getVisibleProducts(updatedList);

      setAllProducts(updatedList);
      setDisplayedProducts(visibleProducts);
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
      const unhiddenProduct = await unhideProduct(maxOrderSellout, id);

      const updatedList = allProducts.map((p) => (p.id === id ? unhiddenProduct : p));
      const sortedList = updatedList.sort((a, b) => a.orderSellout - b.orderSellout);
      const visibleProducts = getVisibleProducts(sortedList);

      setAllProducts(sortedList);
      setDisplayedProducts(visibleProducts);
      setCurrentView(VIEW_VISIBLEPRODUCTS);

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

  const handlePrepareChangeOrderSelloutForm = (productInfo: ProductToMove) => {
    const productId = productInfo.id;
    if (!productId) return;
    const OrderSelloutForUI = getProductPosition(displayedProducts, productId);
    setIsDrawerOpen(true);
    setIsFormOrderSelloutOpen(true);
    setProductToMove({
      id: productId,
      orderSellout: OrderSelloutForUI,
      title: productInfo.title
    });
  };

  return {
    // General State
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
