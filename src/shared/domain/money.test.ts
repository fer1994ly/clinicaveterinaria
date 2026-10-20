import { describe, expect, it } from 'vitest'
import { hasDecimalPart, isPositiveInteger, parseAmount, percentOf, sumAmounts } from './money'

describe('money', () => {
  it('sums integer amounts', () => {
    expect(sumAmounts([1000, 2500, 500])).toBe(4000)
    expect(sumAmounts([])).toBe(0)
  })

  it('computes percentage of budget, treating zero budget safely', () => {
    expect(percentOf(50, 100)).toBe(50)
    expect(percentOf(0, 100)).toBe(0)
    expect(percentOf(10, 0)).toBe(Infinity)
    expect(percentOf(0, 0)).toBe(0)
  })

  it('detects positive integers', () => {
    expect(isPositiveInteger(1)).toBe(true)
    expect(isPositiveInteger(0)).toBe(false)
    expect(isPositiveInteger(-5)).toBe(false)
    expect(isPositiveInteger(1.5)).toBe(false)
    expect(isPositiveInteger(Number.NaN)).toBe(false)
  })

  it('parses user typed amounts', () => {
    expect(parseAmount('1500')).toBe(1500)
    expect(parseAmount('1.500')).toBe(1500)
    expect(parseAmount('$ 12.345')).toBe(12345)
    expect(parseAmount(' 90000 ')).toBe(90000)
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('12,5')).toBeNull()
  })

  it.each([
    ['120.000', 120000],
    ['1.234.567', 1234567],
    ['$ 1.500', 1500],
  ])('accepts valid thousand grouping %j', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected)
  })

  it.each(['1500.50', '1500,50', '1.5', '1,5', '1.50', '1.500,50', '1500.500', '12.34.567', '.500', '1.5000', '1500,00'])(
    'rejects decimals or invalid grouping %j',
    (raw) => {
      expect(parseAmount(raw)).toBeNull()
    },
  )

  it('flags numeric text that cannot be a whole-peso amount as having a decimal part', () => {
    expect(hasDecimalPart('1500.50')).toBe(true)
    expect(hasDecimalPart('1,5')).toBe(true)
    expect(hasDecimalPart('1.500')).toBe(false)
    expect(hasDecimalPart('abc')).toBe(false)
    expect(hasDecimalPart('')).toBe(false)
  })
})
