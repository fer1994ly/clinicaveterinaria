import { sumAmounts } from '../../../shared/domain/money'
import type { YearMonth } from '../../../shared/domain/yearMonth'
import { CATEGORIES } from '../domain/category'
import { summarizeCategory, type CategorySummary } from '../domain/categorySummary'
import type { BudgetReader, SpendSource } from '../domain/ports'

export interface MonthlyOverview {
  month: YearMonth
  /** sum of spending across all categories in the month */
  total: number
  totalBudget: number
  exceededCount: number
  categories: CategorySummary[]
}

/** Monthly totals are always derived from expense dates: nothing is ever "reset" or deleted. */
export function getMonthlyOverview(
  deps: { budgets: BudgetReader; expenses: SpendSource },
  month: YearMonth,
): MonthlyOverview {
  const budgets = deps.budgets.getAll()
  const inMonth = deps.expenses.all().filter((e) => month.contains(e.date))
  const categories = CATEGORIES.map((category) =>
    summarizeCategory(
      category,
      budgets[category.id],
      sumAmounts(inMonth.filter((e) => e.categoryId === category.id).map((e) => e.amount)),
    ),
  )
  return {
    month,
    total: sumAmounts(categories.map((c) => c.spent)),
    totalBudget: sumAmounts(categories.map((c) => c.budget)),
    exceededCount: categories.filter((c) => c.status === 'exceeded').length,
    categories,
  }
}
