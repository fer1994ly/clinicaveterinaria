import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { todayIso, currentYearMonth } from '../shared/domain/clock'
import type { YearMonth } from '../shared/domain/yearMonth'
import { getMonthlyOverview, type MonthlyOverview } from '../features/budgets/application/getMonthlyOverview'
import type { Container } from './container'

const ContainerContext = createContext<Container | null>(null)

export function AppProviders({ container, children }: { container: Container; children: ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>
}

export function useContainer(): Container {
  const container = useContext(ContainerContext)
  if (!container) throw new Error('AppProviders is missing')
  return container
}

export function useExpenses() {
  const { expenses } = useContainer()
  return useSyncExternalStore(expenses.subscribe.bind(expenses), () => expenses.all())
}

export function useBudgets() {
  const { budgets } = useContainer()
  return useSyncExternalStore(budgets.subscribe.bind(budgets), () => budgets.getAll())
}

/** ISO date of "today" according to the injected clock. */
export function useToday(): string {
  return todayIso(useContainer().clock)
}

export function useCurrentMonth(): YearMonth {
  return currentYearMonth(useContainer().clock)
}

export function useMonthlyOverview(month: YearMonth): MonthlyOverview {
  const budgets = useBudgets()
  const expenses = useExpenses()
  return useMemo(
    () => getMonthlyOverview({ budgets: { getAll: () => budgets }, expenses: { all: () => expenses } }, month),
    // month is a value object recreated each render; its key identifies it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [budgets, expenses, month.key],
  )
}
