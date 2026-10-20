import type { Clock } from '../../../shared/domain/clock'
import type { IdGenerator } from '../../../shared/domain/id'
import { YearMonth } from '../../../shared/domain/yearMonth'
import type { CategoryId } from '../../budgets/domain/category'
import type { Expense } from '../domain/expense'
import type { ExpenseRepository } from '../domain/ports'

interface SeedItem {
  categoryId: CategoryId
  amount: number
  description: string
  /** 0..1 position within the available days of the month */
  at: number
}

const ins = 'insumos-clinicos'
const med = 'medicamentos-farmacia'
const srv = 'servicios'
const per = 'personal'

/**
 * Story: this month has more surgeries, so Insumos (87%) is near its limit and
 * Medicamentos (112%) is over budget. Servicios and Personal are comfortable.
 */
const CURRENT_MONTH: SeedItem[] = [
  { categoryId: per, amount: 62000, description: 'Sueldo auxiliar veterinaria', at: 0 },
  { categoryId: srv, amount: 14200, description: 'Factura UTE (luz)', at: 0.04 },
  { categoryId: ins, amount: 21500, description: 'Suturas y material quirúrgico — Distribuidora Médica del Sur', at: 0.08 },
  { categoryId: med, amount: 28500, description: 'Antibióticos y antiinflamatorios', at: 0.1 },
  { categoryId: srv, amount: 6800, description: 'Factura OSE (agua)', at: 0.15 },
  { categoryId: ins, amount: 24000, description: 'Anestésicos (isoflurano) para cirugías', at: 0.2 },
  { categoryId: med, amount: 22000, description: 'Vacunas antirrábicas', at: 0.25 },
  { categoryId: ins, amount: 9800, description: 'Guantes y jeringas descartables', at: 0.3 },
  { categoryId: per, amount: 18000, description: 'Limpieza y mantenimiento (jornal)', at: 0.38 },
  { categoryId: med, amount: 26500, description: 'Vacunas polivalentes caninas', at: 0.45 },
  { categoryId: ins, amount: 8700, description: 'Gasas, vendas y material de curación', at: 0.55 },
  { categoryId: med, amount: 19000, description: 'Antiparasitarios externos e internos', at: 0.62 },
  { categoryId: srv, amount: 5500, description: 'Recarga de gas', at: 0.7 },
  { categoryId: med, amount: 24500, description: 'Analgésicos y sueros para post-operatorios', at: 0.78 },
  { categoryId: ins, amount: 14000, description: 'Tests rápidos de laboratorio (parvovirus, moquillo)', at: 0.85 },
  { categoryId: per, amount: 18000, description: 'Horas extra de guardia (fin de semana)', at: 0.92 },
  { categoryId: med, amount: 14500, description: 'Medicación para animales internados', at: 1 },
]

const PREVIOUS_MONTH: SeedItem[] = [
  { categoryId: per, amount: 62000, description: 'Sueldo auxiliar veterinaria', at: 0 },
  { categoryId: srv, amount: 13100, description: 'Factura UTE (luz)', at: 0.1 },
  { categoryId: ins, amount: 16500, description: 'Suturas y material quirúrgico — Distribuidora Médica del Sur', at: 0.15 },
  { categoryId: med, amount: 21000, description: 'Antibióticos y antiinflamatorios', at: 0.2 },
  { categoryId: srv, amount: 6400, description: 'Factura OSE (agua)', at: 0.3 },
  { categoryId: ins, amount: 9200, description: 'Guantes y jeringas descartables', at: 0.4 },
  { categoryId: med, amount: 18500, description: 'Vacunas antirrábicas', at: 0.5 },
  { categoryId: per, amount: 18000, description: 'Limpieza y mantenimiento (jornal)', at: 0.6 },
  { categoryId: srv, amount: 5200, description: 'Recarga de gas', at: 0.7 },
  { categoryId: ins, amount: 7300, description: 'Gasas, vendas y material de curación', at: 0.78 },
  { categoryId: med, amount: 16000, description: 'Antiparasitarios externos e internos', at: 0.85 },
  { categoryId: ins, amount: 11000, description: 'Tests rápidos de laboratorio', at: 0.92 },
  { categoryId: med, amount: 12500, description: 'Analgésicos y sueros', at: 1 },
]

function place(items: SeedItem[], month: YearMonth, lastDay: number, newId: IdGenerator): Expense[] {
  return items.map((item) => ({
    id: newId(),
    categoryId: item.categoryId,
    amount: item.amount,
    date: month.dayIso(1 + Math.round(item.at * (lastDay - 1))),
    description: item.description,
  }))
}

/** Demo expenses generated relative to the clock so the demo always tells the same story. */
export function generateSeedExpenses(clock: Clock, newId: IdGenerator): Expense[] {
  const now = clock.now()
  const current = YearMonth.fromDate(now)
  const previous = current.previous()
  return [
    ...place(PREVIOUS_MONTH, previous, previous.daysInMonth(), newId),
    ...place(CURRENT_MONTH, current, now.getDate(), newId),
  ]
}

/** Seeds only when storage holds no (valid) expense data. Returns whether it seeded. */
export function seedIfEmpty(repo: ExpenseRepository, clock: Clock, newId: IdGenerator): boolean {
  if (repo.hasData()) return false
  repo.replaceAll(generateSeedExpenses(clock, newId))
  return true
}
