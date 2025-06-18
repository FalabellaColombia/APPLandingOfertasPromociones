import { useFilters } from '@/hooks/useFilters'
import FilterBadge from './FilterBadge'

export default function CategoryBadges() {
   const { columnFilters } = useFilters()

   const categoryFilter = columnFilters.find((f) => f.id === 'category')
   const categoryValues = Array.isArray(categoryFilter?.value)
      ? categoryFilter.value
      : []

   return (
      <div className="flex space-x-1.5">
         {categoryValues.map((category) => (
            <FilterBadge key={category} name={category} />
         ))}
      </div>
   )
}
