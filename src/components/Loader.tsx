import { LoaderCircle } from 'lucide-react'

export function Loader() {
   return (
      <div className="inline-flex items-center px-4 py-2">
         <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
      </div>
   )
}
