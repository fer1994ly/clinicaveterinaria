import type { SpendSource } from '../../budgets/domain/ports'
import type { Expense } from './expense'

export interface ExpenseRepository extends SpendSource {
  /** Stable snapshot: same array reference until data changes. */
  all(): readonly Expense[]
  add(expense: Expense): void
  update(expense: Expense): void
  remove(id: string): void
  replaceAll(expenses: readonly Expense[]): void
  /** true when valid expense data exists in storage (even an empty list). */
  hasData(): boolean
  subscribe(listener: () => void): () => void
}
