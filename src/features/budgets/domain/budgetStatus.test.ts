import { describe, expect, it } from 'vitest'
import { budgetStatus } from './budgetStatus'

describe('budgetStatus', () => {
  const budget = 100000

  it('is ok just below 80%', () => {
    expect(budgetStatus(79999, budget)).toBe('ok') // 79.999%
    expect(budgetStatus(0, budget)).toBe('ok')
  })

  it('is warning at exactly 80%', () => {
    expect(budgetStatus(80000, budget)).toBe('warning')
  })

  it('is warning at exactly 100%', () => {
    expect(budgetStatus(100000, budget)).toBe('warning')
  })

  it('is exceeded just above 100%', () => {
    expect(budgetStatus(100001, budget)).toBe('exceeded')
  })

  it('handles a zero budget', () => {
    expect(budgetStatus(0, 0)).toBe('ok')
    expect(budgetStatus(1, 0)).toBe('exceeded')
  })

  it('does not suffer floating point drift on odd budgets', () => {
    // 80% of 35.000 is exactly 28.000
    expect(budgetStatus(27999, 35000)).toBe('ok')
    expect(budgetStatus(28000, 35000)).toBe('warning')
  })
})
