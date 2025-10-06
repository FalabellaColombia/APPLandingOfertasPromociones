import { getAllProducts } from "@/api/products";
import Sonner from "@/components/Sonner";
import type { Product, ProductForm } from "@/types/product";
import { formatProductDates, getVisibleProducts } from "@/utils/product.utils";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { isDirty } from "zod";
import { useProductActions } from "./useProductActions";
import { useProductForm } from "./useProductForm";
import { useRealtimeSync } from "./useRealtimeSync";
import { useSyncManager } from "./useSyncManager";

export function useProductsProvider() {
  const [isLoading, setIsloading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25
  });

  const { register, handleSubmit, control, reset, errors, formIsDirty, setFormIsDirty } = useProductForm();

  const {
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
  } = useProductActions({ reset });

  const { updateLastRealtimeEvent, forceResync, isSyncing } = useSyncManager({
    setAllProducts,
    setDisplayedProducts,
    currentView
  });

  useRealtimeSync({
    currentView,
    setAllProducts,
    setDisplayedProducts,
    updateLastRealtimeEvent
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsloading(true);
        const data = await getAllProducts();
        setAllProducts(data);
        setDisplayedProducts(getVisibleProducts(data));
      } catch (error) {
        console.error("Error cargando productos:", error);
        Sonner({
          message: "Error cargando productos",
          sonnerState: "error"
        });
      } finally {
        setIsloading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitForm = (data: ProductForm) => {
    const payload: Product = formatProductDates({
      ...data,
      offerState: data.offerState || null
    });

    if (isFormEditingOpen) {
      handleEditProduct(payload);
    } else {
      handleAddProduct(payload);
    }
  };

  const handleBackdropDrawerClick = () => {
    if (formIsDirty) {
      setShowConfirmDialog(true);
    } else {
      setIsDrawerOpen(false);
      setFormIsDirty(false);
      setIsFormOrderSelloutOpen(false);
    }
  };

  return {
    // Data
    allProducts,
    setAllProducts,
    displayedProducts,
    setDisplayedProducts,
    pagination,
    setPagination,
    isLoading,

    // Form
    register,
    handleSubmit,
    Controller,
    control,
    onSubmitForm,
    reset,
    errors,
    isDirty,
    isFormEditingOpen,
    setIsFormEditingOpen,
    formIsDirty,
    setFormIsDirty,
    setIsFormOrderSelloutOpen,

    // UI State
    isModalOpen,
    setIsModalOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    showConfirmDialog,
    setShowConfirmDialog,
    isFormOrderSelloutOpen,
    productToMove,

    // Sync
    isSyncing,
    forceResync,

    // Actions
    handleAddProduct,
    handlePrepareEditForm,
    handleEditProduct,
    handleDeleteProduct,
    handleHideProduct,
    handleUnhideProduct,
    handleBackdropDrawerClick,
    handlePrepareChangeOrderSelloutForm,

    // View State
    currentView,
    setCurrentView,
    isFormButtonLoading
  };
}
