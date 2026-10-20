import { describe, expect, it } from 'vitest'
import { EXPENSES_KEY, LocalExpenseRepository } from './localExpenseRepository'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'
import type { Expense } from '../domain/expense'

const sample: Expense = {
  id: 'a',
  categoryId: 'servicios',
  amount: 100,
  date: '2026-10-01',
  description: 'Recarga de gas',
}

describe('LocalExpenseRepository', () => {
  it('persists across instances sharing the same storage', () => {
    const storage = new MemoryStorage()
    new LocalExpenseRepository(storage).add(sample)
    expect(new LocalExpenseRepository(storage).all()).toEqual([sample])
  })

  it('distinguishes empty storage from an empty list', () => {
    const storage = new MemoryStorage()
    const repo = new LocalExpenseRepository(storage)
    expect(repo.hasData()).toBe(false)
    repo.add(sample)
    repo.remove('a')
    expect(repo.all()).toEqual([])
    expect(repo.hasData()).toBe(true)
  })

  it('treats corrupt JSON as no data', () => {
    const storage = new MemoryStorage()
    storage.setItem(EXPENSES_KEY, '{broken')
    const repo = new LocalExpenseRepository(storage)
    expect(repo.hasData()).toBe(false)
    expect(repo.all()).toEqual([])
  })

  it('drops malformed records but keeps valid ones', () => {
    const storage = new MemoryStorage()
    storage.setItem(EXPENSES_KEY, JSON.stringify([sample, { id: 'x', amount: 'mucho' }, null]))
    expect(new LocalExpenseRepository(storage).all()).toEqual([sample])
  })

  it('replaces all records and notifies subscribers on every change', () => {
    const repo = new LocalExpenseRepository(new MemoryStorage())
    let calls = 0
    const off = repo.subscribe(() => calls++)
    repo.add(sample)
    repo.update({ ...sample, amount: 5 })
    repo.replaceAll([])
    off()
    repo.add(sample)
    expect(calls).toBe(3)
  })

  it('returns a stable snapshot until data changes', () => {
    const repo = new LocalExpenseRepository(new MemoryStorage())
    repo.add(sample)
    expect(repo.all()).toBe(repo.all())
    const before = repo.all()
    repo.add({ ...sample, id: 'b' })
    expect(repo.all()).not.toBe(before)
  })
})
