import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/components/ui/tooltip'
import { useProducts } from '@/hooks/useProducts'


function SyncButton() {
   const { syncProducts } = useProducts()

   const handleSync = async () => {
      await syncProducts()
   }

   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger asChild>
               <Button
                  onClick={handleSync}
                  variant="outline"
                  size="icon"
                  className="size-9 hover:!bg-muted">
                  <RefreshCcw aria-hidden="true" />
               </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sincronizar data</TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

export default SyncButton
