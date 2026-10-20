import { CATEGORIES, type CategoryId } from '../../budgets/domain/category'
import { Button } from '../../../shared/ui/Button'
import { SelectField, TextField } from '../../../shared/ui/fields'
import type { HistoryFilters as Filters } from '../application/queryHistory'

interface HistoryFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  onClear: () => void
}

export function HistoryFilters({ filters, onChange, onClear }: HistoryFiltersProps) {
  return (
    <form
      role="search"
      aria-label="Filtros del historial"
      onSubmit={(event) => event.preventDefault()}
      className="space-y-3 rounded-2xl bg-white p-4 shadow-card"
    >
      <TextField
        id="filter-search"
        label="Buscar en la descripción"
        type="search"
        placeholder="Ej.: vacunas"
        autoComplete="off"
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <SelectField
        id="filter-category"
        label="Categoría"
        value={filters.categoryId ?? ''}
        onChange={(e) => onChange({ ...filters, categoryId: (e.target.value || undefined) as CategoryId | undefined })}
      >
        <option value="">Todas las categorías</option>
        {CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </SelectField>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <TextField
          id="filter-from"
          label="Desde"
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
        />
        <TextField
          id="filter-to"
          label="Hasta"
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
        />
      </div>
      <Button variant="secondary" className="w-full" onClick={onClear}>
        Limpiar filtros
      </Button>
    </form>
  )
}
