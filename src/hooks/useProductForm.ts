// hooks/useProductForm.ts
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ProductForm } from '@/types/product'
import { productFormSchema } from '@/lib/schemas/product.schema'
import { getDefaultResetForm } from '@/utils/product.utils'

export function useProductForm() {
   const [formIsDirty, setFormIsDirty] = useState(false)

   const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors, isDirty },
   } = useForm<ProductForm>({
      resolver: zodResolver(productFormSchema),
      mode: 'onChange',
      defaultValues: getDefaultResetForm(),
   })

   useEffect(() => {
      setFormIsDirty(isDirty)
   }, [isDirty])

   return {
      register,
      handleSubmit,
      control,
      reset,
      errors,
      formIsDirty,
      setFormIsDirty,
   }
}
