import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from './Loader'
import { useProducts } from '@/hooks/useProducts'
import type { Product, ProductToMoveForm } from '@/types/product'
import { productToMoveSchema } from '@/lib/schemas/product.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import Sonner from './Sonner'
import { adjustOrderSellout } from '@/utils/product.utils'
import { upsertProducts } from '@/api/products'

export default function FormMoveProduct() {
   const {
      isloadingButton,
      productToMove,
      products,
      setProducts,
      setAllProducts,
      setIsFormOrderSelloutOpen,
      setOpenDrawer,
      setFormIsDirty,
   } = useProducts()

   const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
   } = useForm<ProductToMoveForm>({
      resolver: zodResolver(productToMoveSchema),
      mode: 'onChange',
      defaultValues: {
         neworderSellout: null,
      },
   })

   useEffect(() => {
      setFormIsDirty(isDirty)
   }, [isDirty])

   const onSubmitChangeOrderSellout = async (formData: ProductToMoveForm) => {
      const newOrder = Number(formData.neworderSellout)
      const currentOrder = Number(productToMove.orderSellout)
      const productId = productToMove.id

      if (!productId) return

      if (newOrder === currentOrder) {
         Sonner({
            message: 'El nuevo Orden Sellout no puede ser igual al actual',
            sonnerState: 'error',
         })
         return
      }

      const adjustedProducts = adjustOrderSellout(
         products,
         productId,
         currentOrder,
         newOrder
      )

      try {
         await upsertProducts(adjustedProducts)
         applyProductUpdate(adjustedProducts)

         Sonner({
            message: 'Orden Sellout actualizado correctamente',
            sonnerState: 'success',
         })

         setIsFormOrderSelloutOpen(false)
         setOpenDrawer(false)
      } catch (error) {
         if (error) {
            console.error('Error al actualizar productos:', error)
            Sonner({
               message: 'Error al actualizar el Orden Sellout',
               sonnerState: 'error',
            })
            return
         }
      }
   }

   const applyProductUpdate = (updatedProducts: Product[]) => {
      setProducts(updatedProducts)

      setAllProducts((prev) =>
         prev.map((p) => {
            const updated = updatedProducts.find((up) => up.id === p.id)
            return updated ? updated : p
         })
      )
   }

   return (
      <form
         className="space-y-5"
         onSubmit={handleSubmit(onSubmitChangeOrderSellout)}>
         <h3 className="mb-5 font-bold border-b-1 pb-3">
            Cambiar Orden Sellout
         </h3>
         <p className="text-xs text-muted-foreground">
            {productToMove.orderSellout} - {productToMove.title}
         </p>
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="neworderSellout">
               Nuevo Orden Sellout
            </Label>
            <Input
               className="peer w-full"
               id="neworderSellout"
               placeholder="Ingresa el nuevo orden sellout"
               aria-invalid={!!errors.neworderSellout}
               {...register('neworderSellout')}
            />
            {errors.neworderSellout && (
               <p
                  className="peer-aria-invalid:text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.neworderSellout.message}
               </p>
            )}
         </div>

         <Button type="submit" className="w-full" disabled={isloadingButton}>
            {isloadingButton ? <Loader /> : 'Enviar'}
         </Button>
      </form>
   )
}
