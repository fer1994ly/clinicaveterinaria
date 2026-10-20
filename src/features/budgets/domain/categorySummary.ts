import { percentOf } from '../../../shared/domain/money'
import { budgetStatus, type BudgetStatus } from './budgetStatus'
import type { Category, CategoryId } from './category'

export interface CategorySummary {
  categoryId: CategoryId
  name: string
  budget: number
  spent: number
  /** budget - spent (negative when exceeded) */
  remaining: number
  /** amount over budget, 0 when within it */
  overrun: number
  /** real percentage, may exceed 100 (Infinity for zero budget with spending) */
  percent: number
  /** percentage for drawing the bar, capped at 100 */
  barPercent: number
  status: BudgetStatus
}

export function summarizeCategory(category: Category, budget: number, spent: number): CategorySummary {
  const percent = percentOf(spent, budget)
  return {
    categoryId: category.id,
    name: category.name,
    budget,
    spent,
    remaining: budget - spent,
    overrun: Math.max(0, spent - budget),
    percent,
    barPercent: Math.min(100, percent),
    status: budgetStatus(spent, budget),
  }
}
