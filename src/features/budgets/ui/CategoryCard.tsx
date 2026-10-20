import { AlertIcon, CheckIcon } from '../../../shared/ui/icons'
import { formatCurrency, formatPercent } from '../../../shared/ui/formatters'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import type { CategorySummary } from '../domain/categorySummary'
import { STATUS_STYLES } from './statusStyles'

export function CategoryCard({ summary }: { summary: CategorySummary }) {
  const style = STATUS_STYLES[summary.status]
  const exceeded = summary.status === 'exceeded'
  return (
    <article
      data-testid={`category-card-${summary.categoryId}`}
      data-status={summary.status}
      className={`min-w-0 rounded-2xl bg-white p-4 shadow-card ${style.card}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 break-words text-lg font-extrabold leading-tight">{summary.name}</h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}
        >
          {exceeded ? <AlertIcon className="h-4 w-4" /> : summary.status === 'ok' ? <CheckIcon className="h-4 w-4" /> : <AlertIcon className="h-4 w-4" />}
          {style.label}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={summary.barPercent}
          label={`Uso del presupuesto de ${summary.name}`}
          fillClassName={style.bar}
        />
        <p className="mt-1 text-sm text-ink-soft">{formatPercent(summary.percent)} del presupuesto usado</p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <dt className="text-sm text-ink-soft">Presupuesto</dt>
          <dd className="text-lg font-semibold">{formatCurrency(summary.budget)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-ink-soft">Gastado</dt>
          <dd className="text-lg font-semibold">{formatCurrency(summary.spent)}</dd>
        </div>
      </dl>

      {exceeded ? (
        <p className="mt-3 rounded-xl bg-danger-dark px-3 py-2 text-base font-bold text-white">
          Excedido por {formatCurrency(summary.overrun)}
        </p>
      ) : (
        <p className="mt-3 text-base font-semibold text-ink">Quedan {formatCurrency(summary.remaining)}</p>
      )}
    </article>
  )
}
