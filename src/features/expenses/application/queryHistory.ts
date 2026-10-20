import { sumAmounts } from '../../../shared/domain/money'
import type { CategoryId } from '../../budgets/domain/category'
import type { Expense } from '../domain/expense'
import { normalizeText } from '../domain/searchText'

export interface HistoryFilters {
  categoryId?: CategoryId
  /** inclusive ISO date */
  from?: string
  /** inclusive ISO date */
  to?: string
  search?: string
}

export interface HistoryResult {
  items: Expense[]
  count: number
  total: number
}

/** All expenses (every month), newest first; later-added wins on equal dates. */
export function queryHistory(expenses: readonly Expense[], filters: HistoryFilters): HistoryResult {
  const needle = normalizeText(filters.search ?? '')
  const items = expenses
    .map((expense, index) => ({ expense, index }))
    .filter(({ expense: x }) => {
      if (filters.categoryId && x.categoryId !== filters.categoryId) return false
      if (filters.from && x.date < filters.from) return false
      if (filters.to && x.date > filters.to) return false
      if (needle && !normalizeText(x.description).includes(needle)) return false
      return true
    })
    .sort((a, b) => {
      if (a.expense.date === b.expense.date) return b.index - a.index
      return a.expense.date < b.expense.date ? 1 : -1
    })
    .map(({ expense }) => expense)
  return { items, count: items.length, total: sumAmounts(items.map((x) => x.amount)) }
}
