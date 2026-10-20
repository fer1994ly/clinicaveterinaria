import { describe, expect, it } from 'vitest'
import { generateSeedExpenses, seedIfEmpty } from './seed'
import { LocalExpenseRepository } from './localExpenseRepository'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'
import { FixedClock } from '../../../shared/infrastructure/fixedClock'
import { YearMonth } from '../../../shared/domain/yearMonth'
import { getMonthlyOverview } from '../../budgets/application/getMonthlyOverview'
import { DEFAULT_BUDGETS } from '../../budgets/domain/category'

const budgets = { getAll: () => DEFAULT_BUDGETS }
const ids = () => {
  let n = 0
  return () => `seed-${++n}`
}

describe.each(['2026-10-01', '2026-10-03', '2026-10-20', '2026-10-31', '2026-02-02', '2026-03-31'])(
  'seed relative to %s',
  (today) => {
    const clock = new FixedClock(today)
    const now = YearMonth.fromDate(clock.now())
    const seed = generateSeedExpenses(clock, ids())
    const overview = getMonthlyOverview({ budgets, expenses: { all: () => seed } }, now)
    const prev = getMonthlyOverview({ budgets, expenses: { all: () => seed } }, now.previous())

    it('has 15-20 current month expenses, none after today', () => {
      const current = seed.filter((x) => now.contains(x.date))
      expect(current.length).toBeGreaterThanOrEqual(15)
      expect(current.length).toBeLessThanOrEqual(20)
      const day = clock.now().getDate()
      expect(current.every((x) => Number(x.date.slice(8, 10)) <= day)).toBe(true)
    })

    it('has Medicamentos over 100% and another category between 80% and 100%', () => {
      const med = overview.categories.find((c) => c.categoryId === 'medicamentos-farmacia')!
      expect(med.status).toBe('exceeded')
      expect(med.percent).toBeGreaterThan(100)
      const warning = overview.categories.filter((c) => c.percent >= 80 && c.percent <= 100)
      expect(warning.length).toBeGreaterThanOrEqual(1)
      expect(overview.categories.some((c) => c.status === 'ok')).toBe(true)
    })

    it('has about a dozen previous month expenses all within budget', () => {
      const previous = seed.filter((x) => now.previous().contains(x.date))
      expect(previous.length).toBeGreaterThanOrEqual(10)
      expect(previous.length).toBeLessThanOrEqual(14)
      expect(prev.categories.every((c) => c.status !== 'exceeded')).toBe(true)
    })

    it('has unique ids, descriptions and valid ISO dates', () => {
      expect(new Set(seed.map((x) => x.id)).size).toBe(seed.length)
      expect(seed.every((x) => x.description.length > 0)).toBe(true)
      expect(seed.every((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date))).toBe(true)
    })
  },
)

describe('story', () => {
  it('this month spends more on insumos and medicamentos than the previous one', () => {
    const clock = new FixedClock('2026-10-20')
    const seed = generateSeedExpenses(clock, ids())
    const now = YearMonth.of(2026, 10)
    const cur = getMonthlyOverview({ budgets, expenses: { all: () => seed } }, now)
    const prev = getMonthlyOverview({ budgets, expenses: { all: () => seed } }, now.previous())
    for (const id of ['insumos-clinicos', 'medicamentos-farmacia']) {
      const c = cur.categories.find((x) => x.categoryId === id)!
      const p = prev.categories.find((x) => x.categoryId === id)!
      expect(c.spent).toBeGreaterThan(p.spent)
    }
  })
})

describe('seedIfEmpty', () => {
  it('seeds only when storage is empty', () => {
    const storage = new MemoryStorage()
    const repo = new LocalExpenseRepository(storage)
    const clock = new FixedClock('2026-10-20')
    expect(seedIfEmpty(repo, clock, ids())).toBe(true)
    const count = repo.all().length
    expect(count).toBeGreaterThan(20)
    expect(seedIfEmpty(repo, clock, ids())).toBe(false)
    expect(repo.all()).toHaveLength(count)
  })

  it('does not reseed after the user deleted everything', () => {
    const repo = new LocalExpenseRepository(new MemoryStorage())
    const clock = new FixedClock('2026-10-20')
    seedIfEmpty(repo, clock, ids())
    repo.replaceAll([])
    expect(seedIfEmpty(repo, clock, ids())).toBe(false)
    expect(repo.all()).toEqual([])
  })

  it('reseeds when stored data is corrupt', () => {
    const storage = new MemoryStorage()
    storage.setItem('sienra.v1.expenses', 'not json')
    const repo = new LocalExpenseRepository(storage)
    expect(seedIfEmpty(repo, new FixedClock('2026-10-20'), ids())).toBe(true)
    expect(repo.all().length).toBeGreaterThan(0)
  })
})
