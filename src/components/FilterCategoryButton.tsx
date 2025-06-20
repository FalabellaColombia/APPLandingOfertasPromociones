import { ListFilter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuCheckboxItem,
   DropdownMenuContent,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFilters } from '@/hooks/useFilters'

const allCategories = [
   'Tecnologia',
   'Electrohogar',
   'VestuarioMujer',
   'VestuarioHombre',
   'Infantil',
   'Calzado',
   'Belleza',
   'AccesoriosModa',
   'Hogar',
   'Deportes',
   'Otros',
]

export default function FilterCategoryButton() {
   const { selectedCategories, toggleCategory } = useFilters()

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" className='hover:!bg-muted'>
               <ListFilter size={16} />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
            {allCategories.map((category) => (
               <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}>
                  {category}
               </DropdownMenuCheckboxItem>
            ))}
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
