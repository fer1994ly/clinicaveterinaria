import type { KeyValueStorage, WriteObserver } from '../../../shared/domain/storage'
import { CATEGORIES, DEFAULT_BUDGETS, type Budgets, type CategoryId } from '../domain/category'
import type { BudgetRepository } from '../domain/ports'

export const BUDGETS_KEY = 'sienra.v1.budgets'

/** Per category: a valid stored value wins, anything else falls back to that category's default. */
function parse(raw: string | null): Budgets {
  const budgets: Budgets = { ...DEFAULT_BUDGETS }
  if (raw === null) return budgets
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return budgets
    for (const { id } of CATEGORIES) {
      const n = (parsed as Record<string, unknown>)[id]
      if (typeof n === 'number' && Number.isInteger(n) && n > 0) budgets[id] = n
    }
  } catch {
    /* corrupt JSON: defaults */
  }
  return budgets
}

/**
 * Budgets persisted under a versioned key; each category falls back to its default when missing or corrupt.
 * Writes never throw: if the storage refuses one, the value stays in memory and the observer is told.
 */
export class LocalBudgetRepository implements BudgetRepository {
  private readonly listeners = new Set<() => void>()
  private cache: { raw: string | null; value: Budgets } | null = null
  /** latest budgets when the storage refused the write; wins over the stored value */
  private unsaved: Budgets | null = null

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly observer?: WriteObserver,
  ) {}

  /** Stable snapshot: same object until the stored value changes. */
  getAll(): Budgets {
    if (this.unsaved) return this.unsaved
    const raw = this.storage.getItem(BUDGETS_KEY)
    if (this.cache && this.cache.raw === raw) return this.cache.value
    this.cache = { raw, value: parse(raw) }
    return this.cache.value
  }

  set(categoryId: CategoryId, amount: number): void {
    const next: Budgets = { ...this.getAll(), [categoryId]: amount }
    this.commit(next, () => this.storage.setItem(BUDGETS_KEY, JSON.stringify(next)))
  }

  reset(): void {
    this.commit({ ...DEFAULT_BUDGETS }, () => this.storage.removeItem(BUDGETS_KEY))
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private commit(next: Budgets, persist: () => void): void {
    try {
      persist()
      this.unsaved = null
      this.observer?.writeSucceeded()
    } catch {
      this.unsaved = next
      this.observer?.writeFailed()
    }
    this.listeners.forEach((l) => l())
  }
}
