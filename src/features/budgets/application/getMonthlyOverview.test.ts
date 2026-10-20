import { describe, expect, it } from 'vitest'
import { getMonthlyOverview } from './getMonthlyOverview'
import { YearMonth } from '../../../shared/domain/yearMonth'
import type { SpendEntry } from '../domain/spendEntry'
import { DEFAULT_BUDGETS } from '../domain/category'

const entry = (categoryId: SpendEntry['categoryId'], amount: number, date: string): SpendEntry => ({
  categoryId,
  amount,
  date,
})

const deps = (entries: SpendEntry[], budgets = DEFAULT_BUDGETS) => ({
  budgets: { getAll: () => budgets },
  expenses: { all: () => entries },
})

describe('getMonthlyOverview', () => {
  const oct = YearMonth.of(2026, 10)

  it('returns every category with zero spending when there are no expenses', () => {
    const o = getMonthlyOverview(deps([]), oct)
    expect(o.categories).toHaveLength(4)
    expect(o.total).toBe(0)
    expect(o.categories.every((c) => c.status === 'ok' && c.spent === 0)).toBe(true)
  })

  it('only counts expenses of the requested month', () => {
    const o = getMonthlyOverview(
      deps([
        entry('personal', 1000, '2026-10-05'),
        entry('personal', 2000, '2026-09-30'),
        entry('personal', 4000, '2025-10-05'),
        entry('servicios', 500, '2026-10-20'),
      ]),
      oct,
    )
    expect(o.categories.find((c) => c.categoryId === 'personal')?.spent).toBe(1000)
    expect(o.total).toBe(1500)
  })

  it('resets on the month boundary without deleting anything', () => {
    const data = [entry('insumos-clinicos', 7000, '2026-10-31'), entry('insumos-clinicos', 300, '2026-11-01')]
    expect(getMonthlyOverview(deps(data), YearMonth.of(2026, 10)).total).toBe(7000)
    expect(getMonthlyOverview(deps(data), YearMonth.of(2026, 11)).total).toBe(300)
  })

  it('uses current budgets for any month and reports the total budget', () => {
    const budgets = { ...DEFAULT_BUDGETS, servicios: 10000 }
    const o = getMonthlyOverview(deps([entry('servicios', 12000, '2026-10-02')], budgets), oct)
    const servicios = o.categories.find((c) => c.categoryId === 'servicios')!
    expect(servicios.budget).toBe(10000)
    expect(servicios.status).toBe('exceeded')
    expect(o.totalBudget).toBe(budgets['insumos-clinicos'] + budgets['medicamentos-farmacia'] + 10000 + budgets.personal)
  })

  it('counts exceeded categories', () => {
    const o = getMonthlyOverview(deps([entry('servicios', 99999, '2026-10-02')]), oct)
    expect(o.exceededCount).toBe(1)
  })
})
