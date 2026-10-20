import { useState, type FormEvent } from 'react'
import { DECIMALS_MESSAGE, hasDecimalPart, parseAmount } from '../../../shared/domain/money'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/fields'
import { updateBudget } from '../../budgets/application/updateBudget'
import { CATEGORIES, type Category } from '../../budgets/domain/category'
import type { BudgetRepository } from '../../budgets/domain/ports'

function BudgetRow({ category, current, repo }: { category: Category; current: number; repo: BudgetRepository }) {
  const [value, setValue] = useState(String(current))
  const [syncedCurrent, setSyncedCurrent] = useState(current)
  const [error, setError] = useState<string | undefined>()
  const [saved, setSaved] = useState(false)

  // The stored budget can change outside this row (e.g. demo data reset): show it.
  if (current !== syncedCurrent) {
    setSyncedCurrent(current)
    setValue(String(current))
    setError(undefined)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = updateBudget(repo, category.id, parseAmount(value) ?? Number.NaN)
    setSaved(result.ok)
    if (result.ok) return setError(undefined)
    setError(hasDecimalPart(value) ? DECIMALS_MESSAGE : result.errors.amount)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-2 rounded-2xl bg-white p-4 shadow-card">
      <TextField
        id={`budget-${category.id}`}
        label={`Presupuesto de ${category.name}`}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        hint="Monto mensual en pesos uruguayos."
        value={value}
        error={error}
        onChange={(e) => {
          setValue(e.target.value)
          setSaved(false)
          setError(undefined)
        }}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" aria-label={`Guardar presupuesto de ${category.name}`}>
          Guardar
        </Button>
        {saved ? (
          <p role="status" className="font-semibold text-health-dark">
            Presupuesto actualizado.
          </p>
        ) : null}
      </div>
    </form>
  )
}

export function BudgetEditor({ repo, budgets }: { repo: BudgetRepository; budgets: Record<string, number> }) {
  return (
    <section aria-label="Presupuestos mensuales" className="space-y-3">
      <h2 className="text-xl font-extrabold">Presupuestos mensuales</h2>
      <p className="text-ink-soft">Los presupuestos son los mismos todos los meses hasta que los cambie.</p>
      {CATEGORIES.map((category) => (
        <BudgetRow key={category.id} category={category} current={budgets[category.id] ?? 0} repo={repo} />
      ))}
    </section>
  )
}
