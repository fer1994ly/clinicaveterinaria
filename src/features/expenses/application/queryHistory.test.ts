import { describe, expect, it } from 'vitest'
import { queryHistory } from './queryHistory'
import type { Expense } from '../domain/expense'

const e = (id: string, categoryId: Expense['categoryId'], amount: number, date: string, description: string): Expense => ({
  id,
  categoryId,
  amount,
  date,
  description,
})

const data: Expense[] = [
  e('1', 'medicamentos-farmacia', 20000, '2026-09-10', 'Antibióticos y antiinflamatorios'),
  e('2', 'insumos-clinicos', 15000, '2026-10-02', 'Suturas y material quirúrgico'),
  e('3', 'servicios', 9000, '2026-10-15', 'Factura UTE (luz)'),
  e('4', 'insumos-clinicos', 5000, '2026-10-15', 'Guantes y jeringas'),
  e('5', 'medicamentos-farmacia', 30000, '2026-10-20', 'Vacunas antirrábicas'),
]

describe('queryHistory', () => {
  it('returns everything newest first with count and total when no filters', () => {
    const r = queryHistory(data, {})
    expect(r.items.map((x) => x.id)).toEqual(['5', '4', '3', '2', '1'])
    expect(r.count).toBe(5)
    expect(r.total).toBe(79000)
  })

  it('keeps later-added expenses first when dates tie', () => {
    const r = queryHistory(data, {})
    expect(r.items.findIndex((x) => x.id === '4')).toBeLessThan(r.items.findIndex((x) => x.id === '3'))
  })

  it('filters by category', () => {
    const r = queryHistory(data, { categoryId: 'insumos-clinicos' })
    expect(r.items.map((x) => x.id)).toEqual(['4', '2'])
    expect(r.total).toBe(20000)
  })

  it('filters by date range, inclusive on both ends', () => {
    expect(queryHistory(data, { from: '2026-10-15' }).count).toBe(3)
    expect(queryHistory(data, { to: '2026-10-02' }).items.map((x) => x.id)).toEqual(['2', '1'])
    expect(queryHistory(data, { from: '2026-10-02', to: '2026-10-15' }).count).toBe(3)
  })

  it('combines category and date range', () => {
    const r = queryHistory(data, { categoryId: 'medicamentos-farmacia', from: '2026-10-01', to: '2026-10-31' })
    expect(r.items.map((x) => x.id)).toEqual(['5'])
  })

  it('searches descriptions ignoring case and accents', () => {
    expect(queryHistory(data, { search: 'ANTIBIOTICOS' }).items.map((x) => x.id)).toEqual(['1'])
    expect(queryHistory(data, { search: 'antirrabicas' }).items.map((x) => x.id)).toEqual(['5'])
    expect(queryHistory(data, { search: 'quirurgico' }).items.map((x) => x.id)).toEqual(['2'])
    expect(queryHistory(data, { search: 'luz' }).items.map((x) => x.id)).toEqual(['3'])
  })

  it('combines search with category and dates', () => {
    const r = queryHistory(data, { search: 'y', categoryId: 'insumos-clinicos', from: '2026-10-10' })
    expect(r.items.map((x) => x.id)).toEqual(['4'])
  })

  it('ignores blank search and returns an empty result without matches', () => {
    expect(queryHistory(data, { search: '   ' }).count).toBe(5)
    const none = queryHistory(data, { search: 'zzz' })
    expect(none).toEqual({ items: [], count: 0, total: 0 })
  })

  it('returns nothing for an inverted date range', () => {
    expect(queryHistory(data, { from: '2026-10-20', to: '2026-10-01' }).count).toBe(0)
  })
})
