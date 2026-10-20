import { Button } from '../../../shared/ui/Button'
import { Dialog } from '../../../shared/ui/Dialog'
import { formatCurrency, formatIsoDate } from '../../../shared/ui/formatters'
import type { Expense } from '../domain/expense'

interface DeleteConfirmDialogProps {
  expense: Expense
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({ expense, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <Dialog
      title="¿Eliminar este gasto?"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Sí, eliminar
          </Button>
        </>
      }
    >
      <p className="break-words">
        {expense.description || 'Sin descripción'} · {formatCurrency(expense.amount)} · {formatIsoDate(expense.date)}
      </p>
      <p className="mt-2">Esta acción no se puede deshacer.</p>
    </Dialog>
  )
}
