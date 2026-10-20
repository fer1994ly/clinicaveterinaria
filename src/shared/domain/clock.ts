import { YearMonth } from './yearMonth'

/** Port: anything that can tell the current moment. Injected so tests can freeze time. */
export interface Clock {
  now(): Date
}

export function todayIso(clock: Clock): string {
  const d = clock.now()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function currentYearMonth(clock: Clock): YearMonth {
  return YearMonth.fromDate(clock.now())
}
