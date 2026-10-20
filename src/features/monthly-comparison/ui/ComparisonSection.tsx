import { formatCurrency } from '../../../shared/ui/formatters'
import type { MonthComparison } from '../application/compareMonths'

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="font-semibold text-ink-soft">Sin cambios</span>
  const more = value > 0
  return (
    <span className={`font-bold ${more ? 'text-danger-dark' : 'text-health-dark'}`}>
      {more ? '▲ +' : '▼ '}
      {formatCurrency(value)}
      <span className="sr-only">{more ? ' más que el mes anterior' : ' menos que el mes anterior'}</span>
    </span>
  )
}

interface RowProps {
  testId: string
  name: string
  previous: number
  current: number
  delta: number
  strong?: boolean
}

function ComparisonRow({ testId, name, previous, current, delta, strong }: RowProps) {
  return (
    <div data-testid={testId} className={`min-w-0 py-3 ${strong ? 'font-bold' : ''}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="min-w-0 break-words font-semibold">{name}</p>
        <Delta value={delta} />
      </div>
      <p className="mt-0.5 text-sm text-ink-soft">
        Mes anterior {formatCurrency(previous)} → Este mes {formatCurrency(current)}
      </p>
    </div>
  )
}

/** Compact "last month vs this month" per category. */
export function ComparisonSection({ comparison }: { comparison: MonthComparison }) {
  return (
    <section
      aria-label="Comparación con el mes actual"
      className="rounded-2xl bg-white p-4 shadow-card"
    >
      <h2 className="text-xl font-extrabold">Comparación con el mes actual</h2>
      <p className="text-sm text-ink-soft">Una diferencia positiva significa que este mes se gasta más.</p>
      <div className="mt-2 divide-y divide-ink/10">
        {comparison.rows.map((row) => (
          <ComparisonRow
            key={row.categoryId}
            testId={`compare-${row.categoryId}`}
            name={row.name}
            previous={row.previous}
            current={row.current}
            delta={row.delta}
          />
        ))}
        <ComparisonRow
          testId="compare-total"
          name="Total"
          previous={comparison.previous.total}
          current={comparison.current.total}
          delta={comparison.totalDelta}
          strong
        />
      </div>
    </section>
  )
}
