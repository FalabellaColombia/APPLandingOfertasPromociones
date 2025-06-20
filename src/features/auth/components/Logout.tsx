import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/components/ui/tooltip'
import supabase from '@/utils/supabase'
import Sonner from '@/components/Sonner'
import { useNavigate } from 'react-router-dom'

function Logout() {
   const navigate = useNavigate()
   const handleLogout = async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
         Sonner({
            message: 'Error cerrando sesion',
            sonnerState: 'error',
         })
         return
      }

      navigate('/login')
   }

   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger asChild>
               <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="icon"
                  className="size-9 hover:!bg-muted">
                  <LogOut aria-hidden="true" />
               </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Cerrar sesión</TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

export default Logout
