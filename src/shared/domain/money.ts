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

const strip = (raw: string) => raw.replace(/\$/g, '').replace(/\s/g, '')

/**
 * Parses what a person types in an amount field: "1500", "1.500", "$ 12.345".
 * es-UY uses "." as thousands separator and "," as decimal mark. Amounts are whole
 * pesos, so a dot only counts as a separator in valid groups of exactly three
 * digits ("1.500", "1.234.567"); anything with a decimal part ("1500.50", "1,5",
 * "1.5") is rejected instead of being silently misread.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = strip(raw)
  if (/^\d+$/.test(cleaned)) return Number(cleaned)
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) return Number(cleaned.replace(/\./g, ''))
  return null
}

/** True for numeric-looking text that parseAmount rejects because of a decimal part or bad grouping. */
export function hasDecimalPart(raw: string): boolean {
  const cleaned = strip(raw)
  return /^[\d.,]*\d[\d.,]*$/.test(cleaned) && parseAmount(raw) === null
}

export const DECIMALS_MESSAGE = 'Ingrese un monto en pesos, sin decimales.'
