import { describe, expect, it } from 'vitest'
import { YearMonth } from './yearMonth'

describe('YearMonth', () => {
  it('builds from an ISO date and exposes a stable key', () => {
    const ym = YearMonth.fromIsoDate('2026-10-20')
    expect(ym.year).toBe(2026)
    expect(ym.month).toBe(10)
    expect(ym.key).toBe('2026-10')
  })

  it('knows whether an ISO date belongs to it (month boundary)', () => {
    const oct = YearMonth.of(2026, 10)
    expect(oct.contains('2026-10-01')).toBe(true)
    expect(oct.contains('2026-10-31')).toBe(true)
    expect(oct.contains('2026-11-01')).toBe(false)
    expect(oct.contains('2025-10-15')).toBe(false)
  })

  it('computes previous month across year boundary', () => {
    expect(YearMonth.of(2026, 10).previous().key).toBe('2026-09')
    expect(YearMonth.of(2026, 1).previous().key).toBe('2025-12')
  })

  it('computes days in month including leap years', () => {
    expect(YearMonth.of(2026, 10).daysInMonth()).toBe(31)
    expect(YearMonth.of(2026, 2).daysInMonth()).toBe(28)
    expect(YearMonth.of(2028, 2).daysInMonth()).toBe(29)
  })

  it('builds an ISO date clamped to valid days', () => {
    expect(YearMonth.of(2026, 2).dayIso(31)).toBe('2026-02-28')
    expect(YearMonth.of(2026, 10).dayIso(5)).toBe('2026-10-05')
    expect(YearMonth.of(2026, 10).dayIso(0)).toBe('2026-10-01')
  })

  it('rejects invalid months', () => {
    expect(() => YearMonth.of(2026, 13)).toThrow()
  })

  it('formats a Spanish label', () => {
    expect(YearMonth.of(2026, 10).label()).toBe('octubre de 2026')
  })
})
