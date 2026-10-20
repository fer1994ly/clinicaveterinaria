import { act, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '../test-utils/renderApp'

const HOUR = 60 * 60 * 1000

describe('Month rollover while the app stays open', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('moves to the new month at local midnight and resets the monthly total', () => {
    const { clock } = renderApp({ route: '/', today: '2026-10-31' })
    expect(screen.getByRole('heading', { name: 'Octubre de 2026' })).toBeInTheDocument()
    expect(screen.getByTestId('month-total')).not.toHaveTextContent('$ 0')

    act(() => {
      clock.set('2026-11-01') // 12:00 on Nov 1st; the pending midnight timer fires 12 hours from "now"
      vi.advanceTimersByTime(13 * HOUR)
    })

    expect(screen.getByRole('heading', { name: 'Noviembre de 2026' })).toBeInTheDocument()
    expect(screen.getByTestId('month-total')).toHaveTextContent('$ 0')
  })

  it('re-checks the day when the tab becomes visible again', () => {
    const { clock } = renderApp({ route: '/', today: '2026-10-31' })
    act(() => {
      clock.set('2026-11-01')
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(screen.getByRole('heading', { name: 'Noviembre de 2026' })).toBeInTheDocument()
  })

  it('re-checks the day when the window regains focus', () => {
    const { clock } = renderApp({ route: '/', today: '2026-10-31' })
    act(() => {
      clock.set('2026-11-01')
      window.dispatchEvent(new Event('focus'))
    })
    expect(screen.getByRole('heading', { name: 'Noviembre de 2026' })).toBeInTheDocument()
  })

  it('keeps the same month and a single pending timer while the day does not change', () => {
    renderApp({ route: '/', today: '2026-10-20' })
    act(() => {
      vi.advanceTimersByTime(1 * HOUR)
    })
    expect(screen.getByRole('heading', { name: 'Octubre de 2026' })).toBeInTheDocument()
    expect(vi.getTimerCount()).toBeLessThanOrEqual(1)
  })

  it('clears its timer and listeners on unmount', () => {
    const { unmount, clock } = renderApp({ route: '/', today: '2026-10-31' })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    clock.set('2026-11-01')
    expect(() => window.dispatchEvent(new Event('focus'))).not.toThrow()
  })
})
