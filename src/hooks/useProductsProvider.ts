import type { ProductForm } from '@/types/product'
import { useEffect, useState } from 'react'
import { getAllProducts } from '@/api/products'
import { getVisibleProducts } from '@/utils/product.utils'
import { useRealtimeSync } from './useRealtimeSync'
import { useProductForm } from './useProductForm'
import { Controller } from 'react-hook-form'
import { isDirty } from 'zod'
import { useProductActions } from './useProductActions'

export function useProductsProvider() {
   const [isLoading, setIsloading] = useState(true)
   const [showConfirmDialog, setShowConfirmDialog] = useState(false)
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 25,
   })

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
      isloadingButton,
      handleAddProduct,
      isModalOpen,
      openDrawer,
      setIsModalOpen,
      setOpenDrawer,
      handlePrepareEditForm,
      handleEditProduct,
      allProducts,
      setAllProducts,
      products,
      setProducts,
      formEditingIsOpen,
      setFormEditingIsOpen,
      handleDeleteProduct,
      activeButton,
      setActiveButton,
      handleHideProduct,
      handleUnhideProduct,
      handleChangeOrderSelloutForm,
      isFormOrderSelloutOpen,
      setIsFormOrderSelloutOpen,
      productToMove,
   } = useProductActions({ reset })

   useEffect(() => {
      const fetch = async () => {
         try {
            const data = await getAllProducts()
            setAllProducts(data)
            setProducts(() => getVisibleProducts(data))
         } catch (error) {
            console.error('Error cargando los productos:', error)
         } finally {
            setIsloading(false)
         }
      }
      fetch()
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

   const { isSync } = useRealtimeSync({
      activeButton,
      setAllProducts,
      setProducts,
   })

   return {
      allProducts,
      setAllProducts,
      products,
      setProducts,
      handleAddProduct,
      handlePrepareEditForm,
      handleEditProduct,
      handleDeleteProduct,
      handleHideProduct,
      handleUnhideProduct,
      register,
      handleSubmit,
      Controller,
      control,
      onSubmitForm,
      reset,
      isDirty,
      setFormIsDirty,
      errors,
      isLoading,
      isloadingButton,
      isModalOpen,
      setIsModalOpen,
      openDrawer,
      setOpenDrawer,
      handleBackdropDrawerClick,
      formEditingIsOpen,
      setFormEditingIsOpen,
      showConfirmDialog,
      setShowConfirmDialog,
      activeButton,
      setActiveButton,
      pagination,
      setPagination,
      isFormOrderSelloutOpen,
      setIsFormOrderSelloutOpen,
      productToMove,
      handleChangeOrderSelloutForm,
      isSync,
   }
}
