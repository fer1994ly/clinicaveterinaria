import { isPositiveInteger } from '../../../shared/domain/money'
import { fail, ok, type Result } from '../../../shared/domain/result'

export function validateBudgetAmount(amount: number): Result<number, 'amount'> {
  if (!isPositiveInteger(amount)) {
    return fail({ amount: 'Ingrese un número entero positivo.' })
  }
  return ok(amount)
}
