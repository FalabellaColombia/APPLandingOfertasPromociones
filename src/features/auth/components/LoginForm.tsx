import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../schema/login.schema'
import supabase from '@/utils/supabase'
import Sonner from '@/components/Sonner'
import { useNavigate } from 'react-router-dom'
export default function LoginForm() {
   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
   })
   const navigate = useNavigate()

   const onSubmitLogin = async (data: LoginFormValues) => {
      const { email, password } = data

      const { error } = await supabase.auth.signInWithPassword({
         email,
         password,
      })

      if (error) {
         Sonner({
            message: 'No se pudo iniciar sesión',
            description: 'Verifica el correo y la contraseña',
            sonnerState: 'error',
            position: 'bottom-right',
         })
         return
      }

      Sonner({
         message: 'Inicio de sesión exitoso',
         sonnerState: 'success',
         position: 'bottom-right',
      })
      setTimeout(() => {
         navigate('/dashboard')
      }, 1000)
   }

   return (
      <div className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100">
         <div className="flex flex-col items-center gap-3">
            <div
               className="flex size-11 shrink-0 items-center justify-center rounded-full border"
               aria-hidden="true">
               <svg
                  style={{ stroke: '#7fc13e' }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  aria-hidden="true">
                  <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
               </svg>
            </div>
            <div className="mb-1">
               <h1 className="sm:text-center mb-2 text-lg font-bold">
                  APP Landing Falabella
               </h1>
               <h2 className="sm:text-center text-muted-foreground text-sm">
                  Ingresa tu correo y contraseña para acceder.
               </h2>
            </div>
         </div>

         <form
            className="space-y-5"
            noValidate
            onSubmit={handleSubmit(onSubmitLogin)}>
            <div className="space-y-4">
               <div className="*:not-first:mt-2">
                  <Label htmlFor={`email`}>Correo electrónico</Label>
                  <Input
                     className="peer"
                     id={`email`}
                     placeholder="correo@tuempresa.com"
                     type="email"
                     aria-invalid={!!errors.email}
                     {...register('email')}
                  />
                  {errors.email && (
                     <p
                        className="peer-aria-invalid:text-destructive mt-0.5 text-xs"
                        role="alert"
                        aria-live="polite">
                        {errors.email.message}
                     </p>
                  )}
               </div>
               <div className="*:not-first:mt-2">
                  <Label htmlFor={`password`}>Contraseña</Label>
                  <Input
                     className="peer"
                     id={`password`}
                     placeholder="Ingresa tu contraseña"
                     type="password"
                     aria-invalid={!!errors.password}
                     {...register('password')}
                  />
                  {errors.password && (
                     <p
                        className="peer-aria-invalid:text-destructive mt-2 text-xs"
                        role="alert"
                        aria-live="polite">
                        {errors.password.message}
                     </p>
                  )}
               </div>
            </div>
            <Button type="submit" className="w-full">
               Iniciar sesión
            </Button>
         </form>
      </div>
   )
}
