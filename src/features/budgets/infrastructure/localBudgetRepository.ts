import type { KeyValueStorage } from '../../../shared/domain/storage'
import { CATEGORIES, DEFAULT_BUDGETS, type Budgets, type CategoryId } from '../domain/category'
import type { BudgetRepository } from '../domain/ports'

export const BUDGETS_KEY = 'sienra.v1.budgets'

const isBudgets = (v: unknown): v is Budgets =>
  typeof v === 'object' &&
  v !== null &&
  CATEGORIES.every((c) => {
    const n = (v as Record<string, unknown>)[c.id]
    return typeof n === 'number' && Number.isInteger(n) && n > 0
  })

function parse(raw: string | null): Budgets {
  if (raw === null) return { ...DEFAULT_BUDGETS }
  try {
    const parsed: unknown = JSON.parse(raw)
    return isBudgets(parsed) ? parsed : { ...DEFAULT_BUDGETS }
  } catch {
    return { ...DEFAULT_BUDGETS }
  }
}

/** Budgets persisted under a versioned key; falls back to defaults when missing or corrupt. */
export class LocalBudgetRepository implements BudgetRepository {
  private readonly listeners = new Set<() => void>()
  private cache: { raw: string | null; value: Budgets } | null = null

  constructor(private readonly storage: KeyValueStorage) {}

  /** Stable snapshot: same object until the stored value changes. */
  getAll(): Budgets {
    const raw = this.storage.getItem(BUDGETS_KEY)
    if (this.cache && this.cache.raw === raw) return this.cache.value
    this.cache = { raw, value: parse(raw) }
    return this.cache.value
  }

  set(categoryId: CategoryId, amount: number): void {
    this.storage.setItem(BUDGETS_KEY, JSON.stringify({ ...this.getAll(), [categoryId]: amount }))
    this.emit()
  }

  reset(): void {
    this.storage.removeItem(BUDGETS_KEY)
    this.emit()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    this.listeners.forEach((l) => l())
  }
}
