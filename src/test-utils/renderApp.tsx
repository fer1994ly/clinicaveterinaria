import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../app/AppProviders'
import { AppRoutes } from '../app/AppRoutes'
import { createContainer } from '../app/container'
import type { KeyValueStorage } from '../shared/domain/storage'
import { FixedClock } from '../shared/infrastructure/fixedClock'
import { MemoryStorage } from '../shared/infrastructure/memoryStorage'

let counter = 0
const newId = () => `test-${++counter}`

export interface RenderAppOptions {
  route?: string
  storage?: KeyValueStorage
  sessionStorage?: KeyValueStorage
  today?: string
}

/** Renders the whole app against in-memory storage and a frozen clock. */
export function renderApp(options: RenderAppOptions = {}) {
  const storage = options.storage ?? new MemoryStorage()
  const sessionStorage = options.sessionStorage ?? new MemoryStorage()
  const clock = new FixedClock(options.today ?? '2026-10-20')
  const container = createContainer({ storage, sessionStorage, clock, newId })
  const user = userEvent.setup()
  const utils = render(
    <AppProviders container={container}>
      <MemoryRouter initialEntries={[options.route ?? '/']}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  )
  return { ...utils, user, storage, sessionStorage, clock, container }
}
