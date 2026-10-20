import { isPositiveInteger, parseAmount } from '../../../shared/domain/money'
import { fail, ok, type Result } from '../../../shared/domain/result'
import { isCategoryId } from '../../budgets/domain/category'
import type { ExpenseDraft, ExpenseField, ExpenseFormInput } from './expense'

export const MAX_DESCRIPTION_LENGTH = 140

function isRealIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

export function validateExpenseInput(input: ExpenseFormInput): Result<ExpenseDraft, ExpenseField> {
  const errors: Partial<Record<ExpenseField, string>> = {}
  const amount = parseAmount(input.amount)
  const description = input.description.trim()

  if (!isCategoryId(input.categoryId)) errors.categoryId = 'Seleccione una categoría.'
  if (amount === null || !isPositiveInteger(amount)) errors.amount = 'Ingrese un monto mayor a cero.'
  if (!isRealIsoDate(input.date)) errors.date = 'Ingrese una fecha válida.'
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `La descripción admite hasta ${MAX_DESCRIPTION_LENGTH} caracteres.`
  }

  if (Object.keys(errors).length > 0 || amount === null || !isCategoryId(input.categoryId)) return fail(errors)
  return ok({ categoryId: input.categoryId, amount, date: input.date, description })
}
