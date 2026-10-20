import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { buttonClasses } from '../shared/ui/Button'
import { ExpenseFormPage } from '../features/expenses/ui/ExpenseFormPage'
import { HistoryPage } from '../features/expenses/ui/HistoryPage'
import { AppShell } from './AppShell'
import { DashboardPage } from './DashboardPage'

// Rarely visited screens are split out to keep the first load small.
const PreviousMonthPage = lazy(() =>
  import('../features/monthly-comparison/ui/PreviousMonthPage').then((m) => ({ default: m.PreviousMonthPage })),
)

function Loading() {
  return <p className="p-4 text-ink-soft">Cargando…</p>
}

function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">No encontramos esta página</h1>
      <p>El enlace puede estar desactualizado. Volvé al resumen para seguir.</p>
      <Link to="/" className={buttonClasses('primary')}>
        Ir al inicio
      </Link>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="gastos" element={<HistoryPage />} />
        <Route path="gastos/nuevo" element={<ExpenseFormPage />} />
        <Route path="gastos/:id/editar" element={<ExpenseFormPage />} />
        <Route
          path="mes-anterior"
          element={
            <Suspense fallback={<Loading />}>
              <PreviousMonthPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
