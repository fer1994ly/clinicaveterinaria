import type { KeyValueStorage } from '../../../shared/domain/storage'
import { isCategoryId } from '../../budgets/domain/category'
import type { Expense } from '../domain/expense'
import type { ExpenseRepository } from '../domain/ports'

export const EXPENSES_KEY = 'sienra.v1.expenses'

const isExpense = (v: unknown): v is Expense => {
  if (typeof v !== 'object' || v === null) return false
  const x = v as Record<string, unknown>
  return (
    typeof x.id === 'string' &&
    isCategoryId(x.categoryId) &&
    typeof x.amount === 'number' &&
    Number.isInteger(x.amount) &&
    x.amount > 0 &&
    typeof x.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(x.date) &&
    typeof x.description === 'string'
  )
}

/** Expenses persisted as one JSON array under a versioned key. Swap this class to move to a backend. */
export class LocalExpenseRepository implements ExpenseRepository {
  private readonly listeners = new Set<() => void>()
  private cache: { raw: string | null; items: readonly Expense[] } = { raw: null, items: [] }

  constructor(private readonly storage: KeyValueStorage) {}

  all(): readonly Expense[] {
    const raw = this.storage.getItem(EXPENSES_KEY)
    if (raw === this.cache.raw) return this.cache.items
    this.cache = { raw, items: this.parse(raw) ?? [] }
    return this.cache.items
  }

  hasData(): boolean {
    return this.parse(this.storage.getItem(EXPENSES_KEY)) !== null
  }

  add(expense: Expense): void {
    this.write([...this.all(), expense])
  }

  update(expense: Expense): void {
    this.write(this.all().map((x) => (x.id === expense.id ? expense : x)))
  }

  remove(id: string): void {
    this.write(this.all().filter((x) => x.id !== id))
  }

  replaceAll(expenses: readonly Expense[]): void {
    this.write([...expenses])
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private write(items: readonly Expense[]): void {
    this.storage.setItem(EXPENSES_KEY, JSON.stringify(items))
    this.listeners.forEach((l) => l())
  }

  /** null when missing/corrupt; otherwise only the well-formed records. */
  private parse(raw: string | null): Expense[] | null {
    if (raw === null) return null
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(isExpense) : null
    } catch {
      return null
    }
  }
}
