import { useMemo } from 'react'
import { useBudgets, useCurrentMonth, useExpenses } from '../../../app/AppProviders'
import { monthLabel } from '../../../shared/ui/formatters'
import { CategoryGrid } from '../../budgets/ui/CategoryGrid'
import { MonthlyTotalCard } from '../../budgets/ui/MonthlyTotalCard'
import { queryHistory } from '../../expenses/application/queryHistory'
import { ExpenseList } from '../../expenses/ui/ExpenseList'
import { compareMonths } from '../application/compareMonths'
import { ComparisonSection } from './ComparisonSection'

/** Read-only look at last month: same summaries, its expenses and a comparison. */
export function PreviousMonthPage() {
  const month = useCurrentMonth()
  const budgets = useBudgets()
  const expenses = useExpenses()
  const comparison = useMemo(
    () => compareMonths({ budgets: { getAll: () => budgets }, expenses: { all: () => expenses } }, month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [budgets, expenses, month.key],
  )
  const previous = comparison.previous
  const items = useMemo(
    () => queryHistory(expenses, { from: previous.month.dayIso(1), to: previous.month.dayIso(31) }),
    [expenses, previous.month],
  )

  return (
    <div className="space-y-4">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold">{monthLabel(previous.month)}</h1>
          <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">Solo lectura</span>
        </div>
        <p className="text-ink-soft">Mes anterior: para consultar y comparar, sin modificar nada.</p>
      </header>

      <MonthlyTotalCard
        title="Gasto total del mes anterior"
        total={previous.total}
        totalBudget={previous.totalBudget}
        exceededCount={previous.exceededCount}
        testId="previous-total"
      />
      <CategoryGrid summaries={previous.categories} label="Categorías del mes anterior" />
      <ComparisonSection comparison={comparison} />

      <section aria-label="Gastos del mes anterior" className="space-y-2">
        <h2 className="text-xl font-extrabold">Gastos de {monthLabel(previous.month).toLowerCase()}</h2>
        {items.count === 0 ? (
          <p className="rounded-2xl bg-white p-4 shadow-card">No se registraron gastos en este mes.</p>
        ) : (
          <ExpenseList label="Gastos del mes anterior" items={items.items} />
        )}
      </section>
    </div>
  )
}
