import { fail, ok, type Result } from '../../../shared/domain/result'
import type { Expense, ExpenseField, ExpenseFormInput } from '../domain/expense'
import type { ExpenseRepository } from '../domain/ports'
import { validateExpenseInput } from '../domain/validateExpense'

export function editExpense(
  repo: ExpenseRepository,
  id: string,
  input: ExpenseFormInput,
): Result<Expense, ExpenseField | 'general'> {
  const validation = validateExpenseInput(input)
  if (!validation.ok) return validation
  if (!repo.all().some((x) => x.id === id)) return fail({ general: 'No se encontró el gasto a editar.' })
  const expense: Expense = { id, ...validation.value }
  repo.update(expense)
  return ok(expense)
}
