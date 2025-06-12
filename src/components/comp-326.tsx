import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Component() {
   const id = useId()

   return (
      <div className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100">
         <div className="flex flex-col items-center gap-2">
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
               <h1 className="sm:text-center mb-1 text-lg font-bold">
                  Bienvenido
               </h1>
               <h2 className="sm:text-center text-muted-foreground text-sm">
                  Ingresa tu correo y contraseña para acceder.
               </h2>
            </div>
         </div>

         <form className="space-y-5">
            <div className="space-y-4">
               <div className="*:not-first:mt-2">
                  <Label htmlFor={`${id}-email`}>Correo electrónico</Label>
                  <Input
                     id={`${id}-email`}
                     placeholder="correo@tuempresa.com"
                     type="email"
                     required
                  />
               </div>
               <div className="*:not-first:mt-2">
                  <Label htmlFor={`${id}-password`}>Contraseña</Label>
                  <Input
                     id={`${id}-password`}
                     placeholder="Ingresa tu contraseña"
                     type="password"
                     required
                  />
               </div>
            </div>
            <Button type="button" className="w-full">
               Iniciar sesión
            </Button>
         </form>
      </div>
   )
}
