import { describe, expect, it } from 'vitest'
import { formatCurrency, formatIsoDate, formatPercent } from './formatters'

describe('formatters', () => {
  it('formats UYU without decimals and with dot thousands', () => {
    expect(formatCurrency(120000)).toBe('$ 120.000')
    expect(formatCurrency(0)).toBe('$ 0')
    expect(formatCurrency(999)).toBe('$ 999')
    expect(formatCurrency(1500)).toBe('$ 1.500')
    expect(formatCurrency(1234567)).toBe('$ 1.234.567')
    expect(formatCurrency(-2500)).toBe('-$ 2.500')
  })

  it('formats ISO dates in Spanish short form', () => {
    expect(formatIsoDate('2026-10-05')).toBe('5 oct 2026')
    expect(formatIsoDate('2026-01-31')).toBe('31 ene 2026')
  })

  it('formats percentages rounded', () => {
    expect(formatPercent(79.99)).toBe('80%')
    expect(formatPercent(112.5)).toBe('113%')
    expect(formatPercent(Infinity)).toBe('—')
  })
})
