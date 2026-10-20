import { describe, expect, it } from 'vitest'
import { validateExpenseInput } from './validateExpense'

const valid = {
  categoryId: 'servicios',
  amount: '12.500',
  date: '2026-10-05',
  description: '  Factura UTE (luz)  ',
}

describe('validateExpenseInput', () => {
  it('accepts a complete input and normalizes it', () => {
    const r = validateExpenseInput(valid)
    expect(r).toEqual({
      ok: true,
      value: { categoryId: 'servicios', amount: 12500, date: '2026-10-05', description: 'Factura UTE (luz)' },
    })
  })

  it('allows an empty description', () => {
    const r = validateExpenseInput({ ...valid, description: '' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.description).toBe('')
  })

  it('requires a category', () => {
    const r = validateExpenseInput({ ...valid, categoryId: '' })
    expect(r).toMatchObject({ ok: false, errors: { categoryId: 'Seleccione una categoría.' } })
  })

  it('rejects an unknown category', () => {
    const r = validateExpenseInput({ ...valid, categoryId: 'otra' })
    expect(r.ok).toBe(false)
  })

  it.each(['', '   ', '0', '-5', 'abc', '12,5'])('rejects amount %j', (amount) => {
    const r = validateExpenseInput({ ...valid, amount })
    expect(r).toMatchObject({ ok: false })
    if (!r.ok) expect(r.errors.amount).toBe('Ingrese un monto mayor a cero.')
  })

  it.each(['', '2026-13-01', '2026-02-30', 'hoy', '05/10/2026'])('rejects date %j', (date) => {
    const r = validateExpenseInput({ ...valid, date })
    expect(r).toMatchObject({ ok: false })
    if (!r.ok) expect(r.errors.date).toBe('Ingrese una fecha válida.')
  })

  it('reports every missing required field at once', () => {
    const r = validateExpenseInput({ categoryId: '', amount: '', date: '', description: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['amount', 'categoryId', 'date'])
  })

  it('limits the description length', () => {
    const r = validateExpenseInput({ ...valid, description: 'x'.repeat(141) })
    expect(r).toMatchObject({ ok: false })
    if (!r.ok) expect(r.errors.description).toMatch(/140/)
  })
})
