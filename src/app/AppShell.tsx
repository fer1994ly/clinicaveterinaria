import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { buttonClasses } from '../shared/ui/Button'
import { StorageErrorBanner } from './StorageErrorBanner'
import { CalendarIcon, HomeIcon, ListIcon, LockIcon, PawIcon, PlusIcon } from '../shared/ui/icons'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: HomeIcon, end: true },
  { to: '/gastos', label: 'Gastos', icon: ListIcon, end: true },
  { to: '/mes-anterior', label: 'Mes anterior', icon: CalendarIcon, end: true },
  { to: '/admin', label: 'Admin', icon: LockIcon, end: true },
]

/**
 * Page chrome: brand header, content, bottom tab bar and the "Nuevo gasto" action.
 * The bottom bar and the action are fixed, so <main> reserves enough room below
 * its content (plus the iOS safe area) to never cover the last card.
 */
export function AppShell() {
  const { pathname } = useLocation()
  const onFormPage = pathname.startsWith('/gastos/')

  return (
    <div className="mx-auto min-h-screen max-w-3xl">
      <header className="flex items-center gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-clinic text-ink">
          <PawIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-extrabold leading-tight">Clínica Veterinaria Sienra</p>
          <p className="text-sm text-ink-soft">Control de gastos y presupuestos</p>
        </div>
      </header>

      <StorageErrorBanner />

      <main className="px-4 pb-[calc(11rem+env(safe-area-inset-bottom))] pt-2">
        <Outlet />
      </main>

      {onFormPage ? null : (
        <Link
          to="/gastos/nuevo"
          className={buttonClasses(
            'primary',
            'fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 min-h-[52px] rounded-full px-5 shadow-lg md:right-[calc(50%-23rem)]',
          )}
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo gasto
        </Link>
      )}

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] md:bottom-4 md:left-1/2 md:right-auto md:w-[32rem] md:-translate-x-1/2 md:rounded-2xl md:border md:pb-0 md:shadow-card"
      >
        <ul className="flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="min-w-0 flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold md:rounded-2xl ${
                    isActive ? 'bg-clinic-soft text-ink' : 'text-ink-soft'
                  }`
                }
              >
                <Icon className="h-6 w-6" />
                <span className="max-w-full truncate">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
