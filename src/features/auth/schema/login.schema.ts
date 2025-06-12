import { z } from 'zod'

export const loginSchema = z.object({
   email: z
      .string({
         required_error: 'El correo es obligatorio',
      })
      .email('Correo no válido'),
   password: z
      .string({
         required_error: 'La contraseña es obligatoria',
      })
      .min(3, 'La contraseña debe tener al menos 3 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
