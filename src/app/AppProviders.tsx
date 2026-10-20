import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { todayIso, currentYearMonth } from '../shared/domain/clock'
import type { Clock } from '../shared/domain/clock'
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

const MIDNIGHT_MARGIN_MS = 1000

/** Milliseconds until the next local midnight according to `clock`, plus a small safety margin. */
function msUntilNextMidnight(clock: Clock): number {
  const now = clock.now()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(midnight.getTime() - now.getTime(), 0) + MIDNIGHT_MARGIN_MS
}

/**
 * ISO date of "today" according to the injected clock. It re-reads the clock at the next local
 * midnight and whenever the tab becomes visible or focused again, so a page left open across
 * midnight (or a month end) moves to the new day instead of showing stale totals.
 */
export function useToday(): string {
  const clock = useContainer().clock
  const [today, setToday] = useState(() => todayIso(clock))

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const check = () => {
      setToday(todayIso(clock))
      clearTimeout(timer)
      timer = setTimeout(check, msUntilNextMidnight(clock))
    }
    const onVisible = () => {
      if (document.visibilityState !== 'hidden') check()
    }
    check()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [clock])

  return today
}

export function useCurrentMonth(): YearMonth {
  const clock = useContainer().clock
  const today = useToday()
  // `today` is the trigger: it changes exactly when the calendar day (and so maybe the month) does.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => currentYearMonth(clock), [clock, today])
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
