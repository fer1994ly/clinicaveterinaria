import { ok, type Result } from '../../../shared/domain/result'
import type { CategoryId } from '../domain/category'
import type { BudgetRepository } from '../domain/ports'
import { validateBudgetAmount } from '../domain/validateBudget'

export function updateBudget(
  repo: BudgetRepository,
  categoryId: CategoryId,
  amount: number,
): Result<number, 'amount'> {
  const validation = validateBudgetAmount(amount)
  if (!validation.ok) return validation
  repo.set(categoryId, amount)
  return ok(amount)
}
