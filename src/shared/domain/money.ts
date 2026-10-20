/** Money helpers. Amounts are integer Uruguayan pesos (UYU), no decimals. */

export function sumAmounts(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0)
}

/** Percentage of `budget` covered by `spent`. A zero budget with spending is Infinity. */
export function percentOf(spent: number, budget: number): number {
  if (budget === 0) return spent === 0 ? 0 : Infinity
  return (spent / budget) * 100
}

export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0
}

/**
 * Parses what a person types in an amount field: "1500", "1.500", "$ 12.345".
 * Dots are treated as thousand separators; decimals are not supported.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '')
  if (!/^\d+$/.test(cleaned)) return null
  return Number(cleaned)
}
