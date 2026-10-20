import { useState, useSyncExternalStore } from 'react'
import { useBudgets, useContainer } from '../../../app/AppProviders'
import { Button } from '../../../shared/ui/Button'
import { Dialog } from '../../../shared/ui/Dialog'
import { lockAdmin, resetDemoData, unlockAdmin } from '../application/adminAccess'
import { AdminLogin } from './AdminLogin'
import { BudgetEditor } from './BudgetEditor'

export function AdminPage() {
  const container = useContainer()
  const { adminSession } = container
  const unlocked = useSyncExternalStore(adminSession.subscribe.bind(adminSession), () => adminSession.isUnlocked())
  const budgets = useBudgets()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  if (!unlocked) {
    return <AdminLogin onSubmit={(password) => unlockAdmin(adminSession, password)} />
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Administración</h1>
        <Button variant="secondary" onClick={() => lockAdmin(adminSession)}>
          Cerrar sesión
        </Button>
      </header>

      <BudgetEditor repo={container.budgets} budgets={budgets} />

      <section aria-label="Datos de ejemplo" className="space-y-3 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-xl font-extrabold">Datos de ejemplo</h2>
        <p className="text-ink-soft">
          Vuelve a cargar los gastos de ejemplo del mes actual y del anterior, y los presupuestos originales.
        </p>
        <Button variant="danger" onClick={() => setConfirmingReset(true)}>
          Restablecer datos de ejemplo
        </Button>
        {resetDone ? (
          <p role="status" className="font-semibold text-health-dark">
            Datos de ejemplo restablecidos.
          </p>
        ) : null}
      </section>

      {confirmingReset ? (
        <Dialog
          title="¿Restablecer los datos de ejemplo?"
          onClose={() => setConfirmingReset(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmingReset(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetDemoData(container)
                  setConfirmingReset(false)
                  setResetDone(true)
                }}
              >
                Sí, restablecer
              </Button>
            </>
          }
        >
          <p>Se reemplazarán todos los gastos y presupuestos actuales por los datos de ejemplo.</p>
          <p className="mt-2">Esta acción no se puede deshacer.</p>
        </Dialog>
      ) : null}
    </div>
  )
}
