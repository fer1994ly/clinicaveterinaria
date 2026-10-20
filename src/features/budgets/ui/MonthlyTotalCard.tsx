import { AlertIcon } from '../../../shared/ui/icons'
import { formatCurrency } from '../../../shared/ui/formatters'

interface MonthlyTotalCardProps {
  title: string
  total: number
  totalBudget: number
  exceededCount: number
  testId: string
}

/** Grand total of the month: the first thing the clinic sees. */
export function MonthlyTotalCard({ title, total, totalBudget, exceededCount, testId }: MonthlyTotalCardProps) {
  return (
    <section aria-label={title} className="rounded-2xl bg-clinic p-5 text-ink shadow-card">
      <p className="text-base font-semibold">{title}</p>
      <p data-testid={testId} className="mt-1 break-words font-heading text-4xl font-extrabold">
        {formatCurrency(total)}
      </p>
      <p className="mt-1 text-base">de {formatCurrency(totalBudget)} presupuestados entre todas las categorías</p>
      {exceededCount > 0 ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-base font-semibold text-danger-dark">
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          {exceededCount === 1
            ? '1 categoría superó su presupuesto.'
            : `${exceededCount} categorías superaron su presupuesto.`}
        </p>
      ) : null}
    </section>
  )
}
