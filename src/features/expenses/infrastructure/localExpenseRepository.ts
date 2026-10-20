import type { KeyValueStorage, WriteObserver } from '../../../shared/domain/storage'
import { isCategoryId } from '../../budgets/domain/category'
import type { Expense } from '../domain/expense'
import type { ExpenseRepository } from '../domain/ports'

export const EXPENSES_KEY = 'sienra.v1.expenses'
/** Records (or whole raw values) that could not be read are parked here instead of being destroyed. */
export const EXPENSES_QUARANTINE_KEY = 'sienra.v1.expenses.quarantine'

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

interface Parsed {
  items: Expense[] | null
  /** unreadable records, or the raw string when the whole value was corrupt */
  rejected: unknown[]
}

function parse(raw: string | null): Parsed {
  if (raw === null) return { items: null, rejected: [] }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return { items: null, rejected: [raw] }
    return { items: parsed.filter(isExpense), rejected: parsed.filter((x) => !isExpense(x)) }
  } catch {
    return { items: null, rejected: [raw] }
  }
}

/**
 * Expenses persisted as one JSON array under a versioned key. Swap this class to move to a backend.
 * Writes never throw: if the storage refuses one, the data stays in memory (and is saved with the
 * next successful write) and the observer is told so the UI can warn the user.
 */
export class LocalExpenseRepository implements ExpenseRepository {
  private readonly listeners = new Set<() => void>()
  private cache: { raw: string | null; items: readonly Expense[] } = { raw: null, items: [] }
  /** latest data when the storage refused the write; wins over the stored value */
  private unsaved: readonly Expense[] | null = null

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly observer?: WriteObserver,
  ) {}

  all(): readonly Expense[] {
    if (this.unsaved) return this.unsaved
    const raw = this.storage.getItem(EXPENSES_KEY)
    if (raw === this.cache.raw) return this.cache.items
    this.cache = { raw, items: parse(raw).items ?? [] }
    return this.cache.items
  }

  hasData(): boolean {
    return this.unsaved !== null || parse(this.storage.getItem(EXPENSES_KEY)).items !== null
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
    try {
      this.quarantineUnreadable()
      this.storage.setItem(EXPENSES_KEY, JSON.stringify(items))
      this.unsaved = null
      this.observer?.writeSucceeded()
    } catch {
      this.unsaved = items
      this.observer?.writeFailed()
    }
    this.listeners.forEach((l) => l())
  }

  /** Copies whatever is unreadable in the stored value into the quarantine key before it gets overwritten. */
  private quarantineUnreadable(): void {
    const { rejected } = parse(this.storage.getItem(EXPENSES_KEY))
    if (rejected.length === 0) return
    const existing = this.readQuarantine()
    const seen = new Set(existing.map((x) => JSON.stringify(x)))
    const added = rejected.filter((x) => !seen.has(JSON.stringify(x)))
    if (added.length === 0) return
    this.storage.setItem(EXPENSES_QUARANTINE_KEY, JSON.stringify([...existing, ...added]))
  }

  private readQuarantine(): unknown[] {
    const raw = this.storage.getItem(EXPENSES_QUARANTINE_KEY)
    if (raw === null) return []
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : [raw]
    } catch {
      return [raw]
    }
  }
}
