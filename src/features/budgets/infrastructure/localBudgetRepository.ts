import type { KeyValueStorage } from '../../../shared/domain/storage'
import { readJson, writeJson } from '../../../shared/infrastructure/jsonStorage'
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

export class LocalBudgetRepository implements BudgetRepository {
  private readonly listeners = new Set<() => void>()

  constructor(private readonly storage: KeyValueStorage) {}

  getAll(): Budgets {
    return readJson(this.storage, BUDGETS_KEY, isBudgets) ?? { ...DEFAULT_BUDGETS }
  }

  set(categoryId: CategoryId, amount: number): void {
    writeJson(this.storage, BUDGETS_KEY, { ...this.getAll(), [categoryId]: amount })
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
