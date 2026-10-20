import { describe, expect, it } from 'vitest'
import { EXPENSES_KEY, EXPENSES_QUARANTINE_KEY, LocalExpenseRepository } from './localExpenseRepository'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'
import { FailingStorage } from '../../../test-utils/failingStorage'
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

  it('ignores malformed records when reading but keeps valid ones', () => {
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

  describe('when the storage refuses writes', () => {
    it('keeps the data in memory, reports the failure and does not throw', () => {
      const storage = new FailingStorage()
      const events: string[] = []
      const repo = new LocalExpenseRepository(storage, {
        writeFailed: () => events.push('failed'),
        writeSucceeded: () => events.push('ok'),
      })
      let notified = 0
      repo.subscribe(() => notified++)

      expect(() => repo.add(sample)).not.toThrow()
      expect(repo.all()).toEqual([sample])
      expect(repo.hasData()).toBe(true)
      expect(notified).toBe(1)
      expect(events).toEqual(['failed'])
      expect(storage.getItem(EXPENSES_KEY)).toBeNull()
    })

    it('persists everything kept in memory once the storage works again', () => {
      const storage = new FailingStorage()
      const events: string[] = []
      const repo = new LocalExpenseRepository(storage, {
        writeFailed: () => events.push('failed'),
        writeSucceeded: () => events.push('ok'),
      })
      repo.add(sample)
      storage.failWrites = false
      repo.add({ ...sample, id: 'b' })
      expect(events).toEqual(['failed', 'ok'])
      expect(new LocalExpenseRepository(storage).all().map((x) => x.id)).toEqual(['a', 'b'])
    })

    it('does not lose stored data when a later write fails', () => {
      const storage = new FailingStorage()
      storage.failWrites = false
      const repo = new LocalExpenseRepository(storage)
      repo.add(sample)
      storage.failWrites = true
      repo.add({ ...sample, id: 'b' })
      expect(repo.all().map((x) => x.id)).toEqual(['a', 'b'])
      expect(new LocalExpenseRepository(storage).all().map((x) => x.id)).toEqual(['a'])
    })
  })

  describe('unreadable records', () => {
    const bad = { id: 'x', amount: 'mucho' }

    it('moves malformed records to a quarantine key instead of destroying them on the next write', () => {
      const storage = new MemoryStorage()
      storage.setItem(EXPENSES_KEY, JSON.stringify([sample, bad, null]))
      const repo = new LocalExpenseRepository(storage)
      expect(repo.all()).toEqual([sample])

      repo.add({ ...sample, id: 'b' })

      expect(JSON.parse(storage.getItem(EXPENSES_KEY) ?? '[]')).toHaveLength(2)
      expect(JSON.parse(storage.getItem(EXPENSES_QUARANTINE_KEY) ?? '[]')).toEqual([bad, null])
    })

    it('does not duplicate quarantined records across writes', () => {
      const storage = new MemoryStorage()
      storage.setItem(EXPENSES_KEY, JSON.stringify([sample, bad]))
      const repo = new LocalExpenseRepository(storage)
      repo.add({ ...sample, id: 'b' })
      repo.add({ ...sample, id: 'c' })
      expect(JSON.parse(storage.getItem(EXPENSES_QUARANTINE_KEY) ?? '[]')).toEqual([bad])
    })

    it('quarantines the whole raw value when the stored JSON is corrupt', () => {
      const storage = new MemoryStorage()
      storage.setItem(EXPENSES_KEY, '{broken')
      const repo = new LocalExpenseRepository(storage)
      repo.replaceAll([sample])
      expect(JSON.parse(storage.getItem(EXPENSES_QUARANTINE_KEY) ?? '[]')).toEqual(['{broken'])
      expect(new LocalExpenseRepository(storage).all()).toEqual([sample])
    })

    it('keeps the main data untouched when the quarantine cannot be written', () => {
      const storage = new FailingStorage()
      storage.failWrites = false
      storage.setItem(EXPENSES_KEY, JSON.stringify([sample, bad]))
      storage.failWrites = true
      const repo = new LocalExpenseRepository(storage)
      repo.add({ ...sample, id: 'b' })
      expect(JSON.parse(storage.getItem(EXPENSES_KEY) ?? '[]')).toEqual([sample, bad])
      expect(repo.all().map((x) => x.id)).toEqual(['a', 'b'])
    })
  })
})
