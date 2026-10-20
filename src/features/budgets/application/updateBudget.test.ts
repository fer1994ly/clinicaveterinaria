import { describe, expect, it } from 'vitest'
import { updateBudget } from './updateBudget'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'
import { LocalBudgetRepository } from '../infrastructure/localBudgetRepository'
import { FailingStorage } from '../../../test-utils/failingStorage'
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

  it('keeps valid categories and only defaults the corrupt ones', () => {
    const storage = new MemoryStorage()
    storage.setItem('sienra.v1.budgets', JSON.stringify({ personal: 160000, servicios: 'x', 'insumos-clinicos': -3 }))
    const repo = new LocalBudgetRepository(storage)
    expect(repo.getAll()).toEqual({ ...DEFAULT_BUDGETS, personal: 160000 })
    repo.set('servicios', 40000)
    expect(new LocalBudgetRepository(storage).getAll()).toEqual({ ...DEFAULT_BUDGETS, personal: 160000, servicios: 40000 })
  })

  it('keeps the new budget in memory and reports the failure when the storage refuses the write', () => {
    const storage = new FailingStorage()
    const events: string[] = []
    const repo = new LocalBudgetRepository(storage, {
      writeFailed: () => events.push('failed'),
      writeSucceeded: () => events.push('ok'),
    })
    let notified = 0
    repo.subscribe(() => notified++)
    expect(() => repo.set('personal', 1234)).not.toThrow()
    expect(repo.getAll().personal).toBe(1234)
    expect(notified).toBe(1)
    storage.failWrites = false
    repo.set('servicios', 5000)
    expect(events).toEqual(['failed', 'ok'])
    expect(new LocalBudgetRepository(storage).getAll()).toEqual({ ...DEFAULT_BUDGETS, personal: 1234, servicios: 5000 })
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
