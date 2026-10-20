export type BudgetStatus = 'ok' | 'warning' | 'exceeded'

/**
 * ok: spent < 80% of budget. warning: 80% <= spent <= 100%. exceeded: spent > budget.
 * Integer arithmetic only, so boundaries are exact.
 */
export function budgetStatus(spent: number, budget: number): BudgetStatus {
  if (spent > budget) return 'exceeded'
  if (budget > 0 && spent * 100 >= budget * 80) return 'warning'
  return 'ok'
}
