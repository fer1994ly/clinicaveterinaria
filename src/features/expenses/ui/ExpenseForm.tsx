import { useState, type FormEvent } from 'react'
import { CATEGORIES } from '../../budgets/domain/category'
import { Button } from '../../../shared/ui/Button'
import { SelectField, TextField } from '../../../shared/ui/fields'
import type { ExpenseField, ExpenseFormInput } from '../domain/expense'
import { MAX_DESCRIPTION_LENGTH } from '../domain/validateExpense'

export type FormErrors = Partial<Record<ExpenseField | 'general', string>>

interface ExpenseFormProps {
  initial: ExpenseFormInput
  submitLabel: string
  /** returns field errors when the input was rejected, or null when it was saved */
  onSubmit: (input: ExpenseFormInput) => FormErrors | null
  onCancel: () => void
}

const FIELD_ORDER: ExpenseField[] = ['categoryId', 'amount', 'date', 'description']
const FIELD_IDS: Record<ExpenseField, string> = {
  categoryId: 'expense-category',
  amount: 'expense-amount',
  date: 'expense-date',
  description: 'expense-description',
}

export function ExpenseForm({ initial, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormInput>(initial)
  const [errors, setErrors] = useState<FormErrors>({})

  const change = (field: ExpenseField) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = onSubmit(values)
    if (!result) return
    setErrors(result)
    const firstInvalid = FIELD_ORDER.find((field) => result[field])
    if (firstInvalid) document.getElementById(FIELD_IDS[firstInvalid])?.focus()
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
      <SelectField
        id={FIELD_IDS.categoryId}
        label="Categoría"
        value={values.categoryId}
        error={errors.categoryId}
        onChange={(e) => change('categoryId')(e.target.value)}
      >
        <option value="">Seleccione una categoría</option>
        {CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </SelectField>

      <TextField
        id={FIELD_IDS.amount}
        label="Monto (UYU)"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Ej.: 12500"
        value={values.amount}
        error={errors.amount}
        onChange={(e) => change('amount')(e.target.value)}
      />

      <TextField
        id={FIELD_IDS.date}
        label="Fecha"
        type="date"
        value={values.date}
        error={errors.date}
        onChange={(e) => change('date')(e.target.value)}
      />

      <TextField
        id={FIELD_IDS.description}
        label="Descripción (opcional)"
        type="text"
        maxLength={MAX_DESCRIPTION_LENGTH + 20}
        placeholder="Ej.: Factura UTE (luz)"
        value={values.description}
        error={errors.description}
        onChange={(e) => change('description')(e.target.value)}
      />

      {errors.general ? (
        <p role="alert" className="text-sm font-semibold text-danger-dark">
          {errors.general}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
