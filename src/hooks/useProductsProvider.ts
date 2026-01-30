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

// Main provider hook that centralizes product data,
// form state, UI state, and realtime synchronization logic
export function useProductsProvider() {
  // Loading and global UI state
  const [isLoading, setIsloading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Pagination state shared across product views
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25
  });

  // Product form state and helpers (create / edit)
  const { register, handleSubmit, control, reset, errors, formIsDirty, setFormIsDirty } = useProductForm();

  // Product CRUD actions and related UI state
  const {
    // General UI state
    isFormButtonLoading,
    isModalOpen,
    setIsModalOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    currentView,
    setCurrentView,

    // Product collections
    allProducts,
    setAllProducts,
    displayedProducts,
    setDisplayedProducts,
    productToMove,

    // Edition state
    isFormEditingOpen,
    setIsFormEditingOpen,
    isFormOrderSelloutOpen,
    setIsFormOrderSelloutOpen,

    // Product actions
    handleAddProduct,
    handleEditProduct,
    handlePrepareEditForm,
    handleDeleteProduct,
    handleHideProduct,
    handleUnhideProduct,
    handlePrepareChangeOrderSelloutForm
  } = useProductActions({ reset, setFormIsDirty });

  // Manages conflict resolution and forced resyncs for realtime updates
  const { updateLastRealtimeEvent, forceResync, isSyncing } = useSyncManager({
    setAllProducts,
    setDisplayedProducts,
    currentView
  });

  // Subscribes to realtime product changes and updates local state accordingly
  useRealtimeSync({
    currentView,
    setAllProducts,
    setDisplayedProducts,
    updateLastRealtimeEvent
  });

  // Loads initial product data on mount
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

  // Normalizes form data and routes it to create or edit flows
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

  // Handles drawer close attempts, preventing data loss when the form is dirty
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
