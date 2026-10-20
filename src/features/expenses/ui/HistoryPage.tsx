import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContainer, useExpenses } from '../../../app/AppProviders'
import { formatCurrency } from '../../../shared/ui/formatters'
import { deleteExpense } from '../application/deleteExpense'
import { queryHistory, type HistoryFilters as Filters } from '../application/queryHistory'
import type { Expense } from '../domain/expense'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { ExpenseList } from './ExpenseList'
import { HistoryFilters } from './HistoryFilters'

export function HistoryPage() {
  const navigate = useNavigate()
  const { expenses: repo } = useContainer()
  const expenses = useExpenses()
  const [filters, setFilters] = useState<Filters>({})
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)

  const result = useMemo(() => queryHistory(expenses, filters), [expenses, filters])
  const hasFilters = Boolean(filters.categoryId || filters.from || filters.to || filters.search?.trim())

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Historial de gastos</h1>
      <HistoryFilters filters={filters} onChange={setFilters} onClear={() => setFilters({})} />

      <p data-testid="history-summary" aria-live="polite" className="text-base font-semibold">
        {result.count} {result.count === 1 ? 'gasto' : 'gastos'} · Total {formatCurrency(result.total)}
        {hasFilters ? <span className="font-normal text-ink-soft"> (con filtros)</span> : null}
      </p>

      {result.count === 0 ? (
        <p className="rounded-2xl bg-white p-4 shadow-card">No hay gastos que coincidan con los filtros.</p>
      ) : (
        <ExpenseList
          label="Lista de gastos"
          items={result.items}
          onEdit={(expense) => navigate(`/gastos/${expense.id}/editar`)}
          onDelete={setPendingDelete}
        />
      )}

      {pendingDelete ? (
        <DeleteConfirmDialog
          expense={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteExpense(repo, pendingDelete.id)
            setPendingDelete(null)
          }}
        />
      ) : null}
    </div>
  )
}
