import type { Budgets, CategoryId } from './category'
import type { SpendEntry } from './spendEntry'

export interface BudgetReader {
  getAll(): Budgets
}

export interface BudgetRepository extends BudgetReader {
  set(categoryId: CategoryId, amount: number): void
  reset(): void
  subscribe(listener: () => void): () => void
}

/** Read-only view over expenses, implemented by the expenses slice. */
export interface SpendSource {
  all(): readonly SpendEntry[]
}
