export type CategoryId = 'insumos-clinicos' | 'medicamentos-farmacia' | 'servicios' | 'personal'

export interface Category {
  readonly id: CategoryId
  readonly name: string
}

export const CATEGORIES: readonly Category[] = [
  { id: 'insumos-clinicos', name: 'Insumos clínicos' },
  { id: 'medicamentos-farmacia', name: 'Medicamentos y farmacia' },
  { id: 'servicios', name: 'Servicios (luz, agua, gas)' },
  { id: 'personal', name: 'Personal' },
]

export type Budgets = Record<CategoryId, number>

export const DEFAULT_BUDGETS: Budgets = {
  'insumos-clinicos': 90000,
  'medicamentos-farmacia': 120000,
  servicios: 35000,
  personal: 150000,
}

export function isCategoryId(value: unknown): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value)
}

export function getCategory(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown category: ${id}`)
  return found
}
