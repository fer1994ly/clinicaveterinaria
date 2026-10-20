import type { BudgetStatus } from '../domain/budgetStatus'

interface StatusStyle {
  label: string
  card: string
  badge: string
  bar: string
}

/** Visual language per status. Exceeded is deliberately loud: red border, tinted card, solid badge. */
export const STATUS_STYLES: Record<BudgetStatus, StatusStyle> = {
  ok: {
    label: 'Dentro del presupuesto',
    card: 'border-2 border-transparent',
    badge: 'bg-health-soft text-health-dark',
    bar: 'bg-health',
  },
  warning: {
    label: 'Cerca del límite',
    card: 'border-2 border-warn',
    badge: 'bg-warn-soft text-warn-dark',
    bar: 'bg-warn',
  },
  exceeded: {
    label: 'Presupuesto excedido',
    card: 'border-2 border-danger bg-danger-soft',
    badge: 'bg-danger-dark text-white',
    bar: 'bg-danger',
  },
}
