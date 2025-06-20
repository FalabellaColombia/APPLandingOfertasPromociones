import { XIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useFilters } from '@/hooks/useFilters'

export default function FilterBadge({ name }: { name: string }) {
   const { selectedCategories, toggleCategory } = useFilters()
   if (!selectedCategories.includes(name)) return null

   return (
      <Badge className="gap-0 rounded-md">
         {name}
         <button
            className="focus-visible:border-ring focus-visible:ring-ring/50 text-primary-foreground/60 hover:text-primary-foreground -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center  p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
            onClick={() => toggleCategory(name)}>
            <XIcon size={12} aria-hidden="true" />
         </button>
      </Badge>
   )
}
