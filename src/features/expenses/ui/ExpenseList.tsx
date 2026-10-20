import { getCategory } from '../../budgets/domain/category'
import { formatCurrency, formatIsoDate } from '../../../shared/ui/formatters'
import { IconButton } from '../../../shared/ui/Button'
import { PencilIcon, TrashIcon } from '../../../shared/ui/icons'
import type { Expense } from '../domain/expense'

interface ExpenseListProps {
  label: string
  items: readonly Expense[]
  /** when set, shows edit and delete controls; omit for read-only lists */
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
}

export function ExpenseList({ label, items, onEdit, onDelete }: ExpenseListProps) {
  return (
    <ul aria-label={label} className="divide-y divide-ink/10 overflow-hidden rounded-2xl bg-white shadow-card">
      {items.map((expense) => (
        <li key={expense.id} className="flex items-start gap-2 p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-ink-soft">{formatIsoDate(expense.date)}</p>
              <p className="shrink-0 text-lg font-bold">{formatCurrency(expense.amount)}</p>
            </div>
            <p className="mt-0.5 break-words font-semibold">{expense.description || 'Sin descripción'}</p>
            <span className="mt-1 inline-block rounded-full bg-clinic-soft px-2.5 py-0.5 text-sm text-ink-soft">
              {getCategory(expense.categoryId).name}
            </span>
          </div>
          {onEdit || onDelete ? (
            <div className="flex shrink-0 flex-col sm:flex-row">
              {onEdit ? (
                <IconButton label={`Editar gasto: ${expense.description}`} onClick={() => onEdit(expense)}>
                  <PencilIcon className="h-5 w-5" />
                </IconButton>
              ) : null}
              {onDelete ? (
                <IconButton
                  label={`Eliminar gasto: ${expense.description}`}
                  className="hover:text-danger-dark"
                  onClick={() => onDelete(expense)}
                >
                  <TrashIcon className="h-5 w-5" />
                </IconButton>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
