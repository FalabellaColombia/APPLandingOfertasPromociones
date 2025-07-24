import type { ProductForm } from '@/types/product'
import { useEffect, useState } from 'react'
import { getAllProducts } from '@/api/products'
import { getVisibleProducts } from '@/utils/product.utils'
import { useRealtimeSync } from './useRealtimeSync'
import { useProductForm } from './useProductForm'
import { Controller } from 'react-hook-form'
import { isDirty } from 'zod'
import { useProductActions } from './useProductActions'
import Sonner from '@/components/Sonner'
import { useSyncManager } from './useSyncManager'

export function useProductsProvider() {
   const [isLoading, setIsloading] = useState(true)
   const [showConfirmDialog, setShowConfirmDialog] = useState(false)
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 25,
   })
   const [isSync, setIsSync] = useState<boolean>(false)

   const {
      register,
      handleSubmit,
      control,
      reset,
      errors,
      formIsDirty,
      setFormIsDirty,
   } = useProductForm()

   const {
      // General State
      isloadingButton,
      isModalOpen,
      setIsModalOpen,
      openDrawer,
      setOpenDrawer,
      activeButton,
      setActiveButton,

      // Products
      allProducts,
      setAllProducts,
      products,
      setProducts,
      productToMove,

      // Edition
      formEditingIsOpen,
      setFormEditingIsOpen,
      isFormOrderSelloutOpen,
      setIsFormOrderSelloutOpen,

      // Actions
      handleAddProduct,
      handleEditProduct,
      handlePrepareEditForm,
      handleDeleteProduct,
      handleHideProduct,
      handleUnhideProduct,
      handleChangeOrderSelloutForm,
   } = useProductActions({ reset })

   const syncProducts = async () => {
      try {
         setIsSync(true)
         const data = await getAllProducts()
         setAllProducts(data)
         setProducts(() => getVisibleProducts(data))
      } catch (error) {
         console.error('Error cargando los productos:', error)
         Sonner({
            message: 'Error sincronizando. Intenta de nuevo',
            sonnerState: 'error',
         })
      } finally {
         setIsloading(false)
         setIsSync(false)
      }
   }
   const { markRealtimeActive } = useSyncManager({
      setAllProducts,
      setProducts,
      activeButton,
      setIsSync,
   })

   useRealtimeSync({
      activeButton,
      setAllProducts,
      setProducts,
      markRealtimeActive,
      setIsSync,
      syncProducts,
   })

   useEffect(() => {
      syncProducts()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])
   const onSubmitForm = (data: ProductForm) => {
      if (formEditingIsOpen) {
         handleEditProduct(data)
      } else {
         handleAddProduct(data)
      }
   }

   const handleBackdropDrawerClick = () => {
      if (formIsDirty) {
         setShowConfirmDialog(true)
      } else {
         setOpenDrawer(false)
         setFormIsDirty(false)
         setIsFormOrderSelloutOpen(false)
      }
   }

   return {
      // Data
      allProducts,
      setAllProducts,
      products,
      setProducts,
      pagination,
      setPagination,
      isLoading,
      isSync,
      syncProducts,

      // Form
      register,
      handleSubmit,
      Controller,
      control,
      onSubmitForm,
      reset,
      errors,
      isDirty,
      formEditingIsOpen,
      setFormEditingIsOpen,
      formIsDirty,
      setFormIsDirty,
      setIsFormOrderSelloutOpen,

      // UI State
      isModalOpen,
      setIsModalOpen,
      openDrawer,
      setOpenDrawer,
      showConfirmDialog,
      setShowConfirmDialog,
      isFormOrderSelloutOpen,
      productToMove,

      // Actions
      handleAddProduct,
      handlePrepareEditForm,
      handleEditProduct,
      handleDeleteProduct,
      handleHideProduct,
      handleUnhideProduct,
      handleBackdropDrawerClick,
      handleChangeOrderSelloutForm,

      // View State
      activeButton,
      setActiveButton,
      isloadingButton,
   }
}
