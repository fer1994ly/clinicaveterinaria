import type { Clock } from '../../../shared/domain/clock'
import type { IdGenerator } from '../../../shared/domain/id'
import type { BudgetRepository } from '../../budgets/domain/ports'
import type { ExpenseRepository } from '../../expenses/domain/ports'
import { generateSeedExpenses } from '../../expenses/infrastructure/seed'
import { checkAdminPassword } from '../domain/auth'
import type { AdminSession } from '../domain/ports'

/** Returns whether the password was right (and the session is now unlocked). */
export function unlockAdmin(session: AdminSession, password: string): boolean {
  if (!checkAdminPassword(password)) return false
  session.unlock()
  return true
}

export function lockAdmin(session: AdminSession): void {
  session.lock()
}

/** Replaces every expense with freshly generated demo data and restores default budgets. */
export function resetDemoData(deps: {
  expenses: ExpenseRepository
  budgets: BudgetRepository
  clock: Clock
  newId: IdGenerator
}): void {
  deps.budgets.reset()
  deps.expenses.replaceAll(generateSeedExpenses(deps.clock, deps.newId))
}
