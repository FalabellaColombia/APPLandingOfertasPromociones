import { useRef, useState } from 'react'
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
   const throttleRef = useRef(false)
   const [isThrottled, setIsThrottled] = useState(false)

   const handleSync = async () => {
      if (isThrottled || throttleRef.current) return

      throttleRef.current = true
      setIsThrottled(true)

      await syncProducts()

      setTimeout(() => {
         throttleRef.current = false
         setIsThrottled(false)
      }, 5000)
   }

   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger asChild>
               <div>
                  <Button
                     onClick={handleSync}
                     variant="outline"
                     size="icon"
                     aria-disabled={isThrottled}
                     className={`size-9 hover:!bg-muted transition-colors ${
                        isThrottled
                           ? 'text-muted-foreground cursor-not-allowed pointer-events-none'
                           : ''
                     }`}>
                     <RefreshCcw aria-hidden="true" />
                  </Button>
               </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
               {isThrottled
                  ? 'Sincronización en espera'
                  : 'Forzar sincronización'}
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   )
}

export default SyncButton
