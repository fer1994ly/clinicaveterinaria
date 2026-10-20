import { Link, useNavigate } from 'react-router-dom'
import { monthLabel } from '../shared/ui/formatters'
import { CategoryGrid } from '../features/budgets/ui/CategoryGrid'
import { MonthlyTotalCard } from '../features/budgets/ui/MonthlyTotalCard'
import { queryHistory } from '../features/expenses/application/queryHistory'
import { ExpenseList } from '../features/expenses/ui/ExpenseList'
import { useCurrentMonth, useExpenses, useMonthlyOverview } from './AppProviders'

/** Home: grand total of the month, one card per category, latest expenses. */
export function DashboardPage() {
  const month = useCurrentMonth()
  const overview = useMonthlyOverview(month)
  const expenses = useExpenses()
  const navigate = useNavigate()
  const latest = queryHistory(expenses, {}).items.slice(0, 5)

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Resumen del mes</p>
        <h1 className="text-2xl font-extrabold">{monthLabel(month)}</h1>
      </header>

      <MonthlyTotalCard
        title="Gasto total del mes"
        total={overview.total}
        totalBudget={overview.totalBudget}
        exceededCount={overview.exceededCount}
        testId="month-total"
      />
      <CategoryGrid summaries={overview.categories} label="Categorías del mes" />

      <section aria-label="Últimos gastos" className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-extrabold">Últimos gastos</h2>
          <Link to="/gastos" className="inline-flex min-h-[44px] items-center font-semibold underline">
            Ver todos
          </Link>
        </div>
        <ExpenseList
          label="Últimos gastos registrados"
          items={latest}
          onEdit={(expense) => navigate(`/gastos/${expense.id}/editar`)}
        />
      </section>
    </div>
  )
}
