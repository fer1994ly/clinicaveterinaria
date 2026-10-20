import { sumAmounts } from '../../../shared/domain/money'
import type { YearMonth } from '../../../shared/domain/yearMonth'
import { getMonthlyOverview, type MonthlyOverview } from '../../budgets/application/getMonthlyOverview'
import type { CategoryId } from '../../budgets/domain/category'
import type { BudgetReader, SpendSource } from '../../budgets/domain/ports'

export interface ComparisonRow {
  categoryId: CategoryId
  name: string
  current: number
  previous: number
  /** current - previous: positive means the clinic is spending more than last month */
  delta: number
}

export interface MonthComparison {
  current: MonthlyOverview
  previous: MonthlyOverview
  rows: ComparisonRow[]
  totalDelta: number
}

export function compareMonths(
  deps: { budgets: BudgetReader; expenses: SpendSource },
  currentMonth: YearMonth,
): MonthComparison {
  const current = getMonthlyOverview(deps, currentMonth)
  const previous = getMonthlyOverview(deps, currentMonth.previous())
  const rows = current.categories.map((category) => {
    const before = previous.categories.find((c) => c.categoryId === category.categoryId)?.spent ?? 0
    return {
      categoryId: category.categoryId,
      name: category.name,
      current: category.spent,
      previous: before,
      delta: category.spent - before,
    }
  })
  return { current, previous, rows, totalDelta: sumAmounts(rows.map((r) => r.delta)) }
}
