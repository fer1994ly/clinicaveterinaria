import { describe, expect, it } from 'vitest'
import { currentYearMonth, todayIso } from './clock'
import { FixedClock } from '../infrastructure/fixedClock'

describe('clock helpers', () => {
  it('derives today and current month from the injected clock', () => {
    const clock = new FixedClock('2026-10-20')
    expect(todayIso(clock)).toBe('2026-10-20')
    expect(currentYearMonth(clock).key).toBe('2026-10')
  })

  it('moves across the month boundary when the clock moves', () => {
    const clock = new FixedClock('2026-10-31')
    expect(currentYearMonth(clock).key).toBe('2026-10')
    clock.set('2026-11-01')
    expect(currentYearMonth(clock).key).toBe('2026-11')
  })
})
