import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContainer, useExpenses, useToday } from '../../../app/AppProviders'
import { ArrowLeftIcon } from '../../../shared/ui/icons'
import { buttonClasses } from '../../../shared/ui/Button'
import { addExpense } from '../application/addExpense'
import { editExpense } from '../application/editExpense'
import type { ExpenseFormInput } from '../domain/expense'
import { ExpenseForm, type FormErrors } from './ExpenseForm'

/** One page for creating and editing: /gastos/nuevo and /gastos/:id/editar */
export function ExpenseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { expenses: repo, newId } = useContainer()
  const expenses = useExpenses()
  const today = useToday()
  const editing = id ? expenses.find((x) => x.id === id) : undefined

  if (id && !editing) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold">Editar gasto</h1>
        <p>No encontramos este gasto. Es posible que ya haya sido eliminado.</p>
        <Link to="/gastos" className={buttonClasses('primary')}>
          Volver a los gastos
        </Link>
      </div>
    )
  }

  const initial: ExpenseFormInput = editing
    ? {
        categoryId: editing.categoryId,
        amount: String(editing.amount),
        date: editing.date,
        description: editing.description,
      }
    : { categoryId: '', amount: '', date: today, description: '' }

  const submit = (input: ExpenseFormInput): FormErrors | null => {
    const result = editing ? editExpense(repo, editing.id, input) : addExpense({ repo, newId }, input)
    if (!result.ok) return result.errors
    navigate(editing ? '/gastos' : '/')
    return null
  }

  return (
    <div className="space-y-4">
      <Link to={editing ? '/gastos' : '/'} className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-ink-soft">
        <ArrowLeftIcon className="h-5 w-5" />
        Volver
      </Link>
      <h1 className="text-2xl font-extrabold">{editing ? 'Editar gasto' : 'Nuevo gasto'}</h1>
      <ExpenseForm
        key={id ?? 'new'}
        initial={initial}
        submitLabel={editing ? 'Guardar cambios' : 'Guardar gasto'}
        onSubmit={submit}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
