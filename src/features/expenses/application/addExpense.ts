import type { IdGenerator } from '../../../shared/domain/id'
import { ok, type Result } from '../../../shared/domain/result'
import type { Expense, ExpenseField, ExpenseFormInput } from '../domain/expense'
import type { ExpenseRepository } from '../domain/ports'
import { validateExpenseInput } from '../domain/validateExpense'

export function addExpense(
  deps: { repo: ExpenseRepository; newId: IdGenerator },
  input: ExpenseFormInput,
): Result<Expense, ExpenseField> {
  const validation = validateExpenseInput(input)
  if (!validation.ok) return validation
  const expense: Expense = { id: deps.newId(), ...validation.value }
  deps.repo.add(expense)
  return ok(expense)
}
