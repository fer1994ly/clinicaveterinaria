import type { Clock } from '../shared/domain/clock'
import type { IdGenerator } from '../shared/domain/id'
import type { KeyValueStorage } from '../shared/domain/storage'
import { uuid } from '../shared/infrastructure/uuid'
import type { BudgetRepository } from '../features/budgets/domain/ports'
import { LocalBudgetRepository } from '../features/budgets/infrastructure/localBudgetRepository'
import type { ExpenseRepository } from '../features/expenses/domain/ports'
import { LocalExpenseRepository } from '../features/expenses/infrastructure/localExpenseRepository'
import { seedIfEmpty } from '../features/expenses/infrastructure/seed'

/** Everything the UI needs, wired once at the composition root. */
export interface Container {
  clock: Clock
  newId: IdGenerator
  expenses: ExpenseRepository
  budgets: BudgetRepository
  /** storage for the admin session (sessionStorage in the browser) */
  sessionStorage: KeyValueStorage
}

export interface ContainerOptions {
  /** persistent storage (localStorage in the browser). Swap here to use a backend-backed adapter. */
  storage: KeyValueStorage
  sessionStorage: KeyValueStorage
  clock: Clock
  newId?: IdGenerator
}

export function createContainer(options: ContainerOptions): Container {
  const newId = options.newId ?? uuid
  const expenses = new LocalExpenseRepository(options.storage)
  const budgets = new LocalBudgetRepository(options.storage)
  seedIfEmpty(expenses, options.clock, newId)
  return { clock: options.clock, newId, expenses, budgets, sessionStorage: options.sessionStorage }
}
