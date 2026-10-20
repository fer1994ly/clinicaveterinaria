import { YearMonth } from '../domain/yearMonth'

const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "$ 120.000" — manual grouping so every browser renders the same text. */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(Math.abs(amount))
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${amount < 0 ? '-' : ''}$ ${grouped}`
}

export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${SHORT_MONTHS[(m ?? 1) - 1]} ${y}`
}

export function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '—'
}

export function monthLabel(ym: YearMonth): string {
  const label = ym.label()
  return label.charAt(0).toUpperCase() + label.slice(1)
}
