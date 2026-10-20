import { BrowserRouter } from 'react-router-dom'
import { SystemClock } from '../shared/infrastructure/systemClock'
import { LocalStorageAdapter } from '../shared/infrastructure/localStorageAdapter'
import { SessionStorageAdapter } from '../shared/infrastructure/sessionStorageAdapter'
import { AppProviders } from './AppProviders'
import { AppRoutes } from './AppRoutes'
import { createContainer } from './container'

// Composition root: the only place where concrete adapters are chosen.
const container = createContainer({
  storage: new LocalStorageAdapter(),
  sessionStorage: new SessionStorageAdapter(),
  clock: new SystemClock(),
})

export function App() {
  return (
    <AppProviders container={container}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
