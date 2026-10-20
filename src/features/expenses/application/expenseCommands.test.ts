import { beforeEach, describe, expect, it } from 'vitest'
import { addExpense } from './addExpense'
import { editExpense } from './editExpense'
import { deleteExpense } from './deleteExpense'
import { LocalExpenseRepository } from '../infrastructure/localExpenseRepository'
import { MemoryStorage } from '../../../shared/infrastructure/memoryStorage'

let repo: LocalExpenseRepository
let counter = 0
const newId = () => `id-${++counter}`
const input = { categoryId: 'personal', amount: '62000', date: '2026-10-03', description: 'Sueldo auxiliar veterinaria' }

beforeEach(() => {
  counter = 0
  repo = new LocalExpenseRepository(new MemoryStorage())
})

describe('addExpense', () => {
  it('stores a valid expense with a generated id', () => {
    const r = addExpense({ repo, newId }, input)
    expect(r.ok).toBe(true)
    expect(repo.all()).toEqual([
      { id: 'id-1', categoryId: 'personal', amount: 62000, date: '2026-10-03', description: 'Sueldo auxiliar veterinaria' },
    ])
  })

  it('does not store anything when invalid', () => {
    const r = addExpense({ repo, newId }, { ...input, amount: '' })
    expect(r.ok).toBe(false)
    expect(repo.all()).toHaveLength(0)
  })
})

describe('editExpense', () => {
  it('updates fields keeping the id, moving the amount between categories', () => {
    addExpense({ repo, newId }, input)
    const r = editExpense(repo, 'id-1', { ...input, categoryId: 'servicios', amount: '1.000' })
    expect(r.ok).toBe(true)
    expect(repo.all()[0]).toMatchObject({ id: 'id-1', categoryId: 'servicios', amount: 1000 })
  })

  it('rejects invalid edits leaving data untouched', () => {
    addExpense({ repo, newId }, input)
    const r = editExpense(repo, 'id-1', { ...input, date: '' })
    expect(r.ok).toBe(false)
    expect(repo.all()[0]?.date).toBe('2026-10-03')
  })

  it('fails for an unknown id', () => {
    const r = editExpense(repo, 'nope', input)
    expect(r.ok).toBe(false)
  })
})

describe('deleteExpense', () => {
  it('removes only the requested expense', () => {
    addExpense({ repo, newId }, input)
    addExpense({ repo, newId }, { ...input, amount: '5' })
    deleteExpense(repo, 'id-1')
    expect(repo.all().map((x) => x.id)).toEqual(['id-2'])
  })
})
