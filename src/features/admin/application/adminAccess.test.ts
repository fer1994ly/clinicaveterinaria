import { describe, expect, it } from 'vitest'
import { lockAdmin, resetDemoData, unlockAdmin } from './adminAccess'
import { StorageAdminSession } from '../infrastructure/storageAdminSession'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'
import { FixedClock } from '../../../shared/infrastructure/fixedClock'
import { LocalExpenseRepository } from '../../expenses/infrastructure/localExpenseRepository'
import { LocalBudgetRepository } from '../../budgets/infrastructure/localBudgetRepository'
import { DEFAULT_BUDGETS } from '../../budgets/domain/category'

describe('admin session', () => {
  it('starts locked', () => {
    expect(new StorageAdminSession(new MemoryStorage()).isUnlocked()).toBe(false)
  })

  it('unlocks only with the right password', () => {
    const session = new StorageAdminSession(new MemoryStorage())
    expect(unlockAdmin(session, 'mala')).toBe(false)
    expect(session.isUnlocked()).toBe(false)
    expect(unlockAdmin(session, 'sienra2026')).toBe(true)
    expect(session.isUnlocked()).toBe(true)
  })

  it('persists in the given (session) storage and can be locked again', () => {
    const storage = new MemoryStorage()
    unlockAdmin(new StorageAdminSession(storage), 'sienra2026')
    const reopened = new StorageAdminSession(storage)
    expect(reopened.isUnlocked()).toBe(true)
    lockAdmin(reopened)
    expect(new StorageAdminSession(storage).isUnlocked()).toBe(false)
  })

  it('notifies subscribers when the state changes', () => {
    const session = new StorageAdminSession(new MemoryStorage())
    let calls = 0
    session.subscribe(() => calls++)
    unlockAdmin(session, 'sienra2026')
    lockAdmin(session)
    expect(calls).toBe(2)
  })
})

describe('resetDemoData', () => {
  it('replaces expenses with fresh seed data and restores default budgets', () => {
    const storage = new MemoryStorage()
    const expenses = new LocalExpenseRepository(storage)
    const budgets = new LocalBudgetRepository(storage)
    expenses.replaceAll([])
    budgets.set('personal', 1)
    let n = 0
    resetDemoData({ expenses, budgets, clock: new FixedClock('2026-10-20'), newId: () => `r-${++n}` })
    expect(expenses.all().length).toBeGreaterThan(20)
    expect(budgets.getAll()).toEqual(DEFAULT_BUDGETS)
  })
})
