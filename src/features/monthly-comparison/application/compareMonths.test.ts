import { describe, expect, it } from 'vitest'
import { compareMonths } from './compareMonths'
import { YearMonth } from '../../../shared/domain/yearMonth'
import { DEFAULT_BUDGETS } from '../../budgets/domain/category'
import type { SpendEntry } from '../../budgets/domain/spendEntry'

const entry = (categoryId: SpendEntry['categoryId'], amount: number, date: string): SpendEntry => ({
  categoryId,
  amount,
  date,
})

const run = (entries: SpendEntry[]) =>
  compareMonths({ budgets: { getAll: () => DEFAULT_BUDGETS }, expenses: { all: () => entries } }, YearMonth.of(2026, 10))

describe('compareMonths', () => {
  const entries = [
    entry('insumos-clinicos', 78000, '2026-10-05'),
    entry('insumos-clinicos', 44000, '2026-09-05'),
    entry('servicios', 20000, '2026-10-06'),
    entry('servicios', 25000, '2026-09-06'),
    entry('personal', 80000, '2026-09-01'),
    entry('medicamentos-farmacia', 10000, '2026-08-31'),
  ]

  it('compares the current month with the previous one using the same budgets', () => {
    const c = run(entries)
    expect(c.current.month.key).toBe('2026-10')
    expect(c.previous.month.key).toBe('2026-09')
    expect(c.previous.total).toBe(149000)
  })

  it('computes per-category deltas (current minus previous)', () => {
    const rows = run(entries).rows
    const byId = (id: string) => rows.find((r) => r.categoryId === id)!
    expect(byId('insumos-clinicos')).toMatchObject({ current: 78000, previous: 44000, delta: 34000 })
    expect(byId('servicios')).toMatchObject({ current: 20000, previous: 25000, delta: -5000 })
    expect(byId('personal')).toMatchObject({ current: 0, previous: 80000, delta: -80000 })
    expect(byId('medicamentos-farmacia')).toMatchObject({ current: 0, previous: 0, delta: 0 })
  })

  it('computes the total delta and ignores months other than the two compared', () => {
    const c = run(entries)
    expect(c.totalDelta).toBe(98000 - 149000)
  })

  it('crosses the year boundary', () => {
    const c = compareMonths(
      { budgets: { getAll: () => DEFAULT_BUDGETS }, expenses: { all: () => [entry('personal', 5, '2025-12-31')] } },
      YearMonth.of(2026, 1),
    )
    expect(c.previous.month.key).toBe('2025-12')
    expect(c.previous.total).toBe(5)
  })
})
