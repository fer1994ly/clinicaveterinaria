import { describe, expect, it } from 'vitest'
import { updateBudget } from './updateBudget'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'
import { LocalBudgetRepository } from '../infrastructure/localBudgetRepository'
import { DEFAULT_BUDGETS } from '../domain/category'

describe('updateBudget', () => {
  it('persists a valid budget', () => {
    const repo = new LocalBudgetRepository(new MemoryStorage())
    const r = updateBudget(repo, 'servicios', 42000)
    expect(r.ok).toBe(true)
    expect(repo.getAll().servicios).toBe(42000)
  })

  it.each([0, -1, 1.5, Number.NaN])('rejects %s', (value) => {
    const repo = new LocalBudgetRepository(new MemoryStorage())
    const r = updateBudget(repo, 'servicios', value)
    expect(r.ok).toBe(false)
    expect(repo.getAll().servicios).toBe(DEFAULT_BUDGETS.servicios)
    if (!r.ok) expect(r.errors.amount).toMatch(/entero positivo/)
  })
})

describe('LocalBudgetRepository', () => {
  it('starts with default budgets and survives a new instance', () => {
    const storage = new MemoryStorage()
    expect(new LocalBudgetRepository(storage).getAll()).toEqual(DEFAULT_BUDGETS)
    new LocalBudgetRepository(storage).set('personal', 160000)
    expect(new LocalBudgetRepository(storage).getAll().personal).toBe(160000)
  })

  it('falls back to defaults on corrupt or invalid data', () => {
    const storage = new MemoryStorage()
    storage.setItem('sienra.v1.budgets', '{oops')
    expect(new LocalBudgetRepository(storage).getAll()).toEqual(DEFAULT_BUDGETS)
    storage.setItem('sienra.v1.budgets', JSON.stringify({ personal: -3, servicios: 'x' }))
    expect(new LocalBudgetRepository(storage).getAll()).toEqual(DEFAULT_BUDGETS)
  })

  it('notifies subscribers on change', () => {
    const repo = new LocalBudgetRepository(new MemoryStorage())
    let calls = 0
    const off = repo.subscribe(() => calls++)
    repo.set('personal', 1000)
    off()
    repo.set('personal', 2000)
    expect(calls).toBe(1)
  })

  it('returns a stable snapshot until the budgets change', () => {
    const repo = new LocalBudgetRepository(new MemoryStorage())
    expect(repo.getAll()).toBe(repo.getAll())
    const before = repo.getAll()
    repo.set('personal', 1234)
    expect(repo.getAll()).not.toBe(before)
    expect(repo.getAll()).toBe(repo.getAll())
  })

  it('resets to defaults', () => {
    const repo = new LocalBudgetRepository(new MemoryStorage())
    repo.set('personal', 1)
    repo.reset()
    expect(repo.getAll()).toEqual(DEFAULT_BUDGETS)
  })
})
