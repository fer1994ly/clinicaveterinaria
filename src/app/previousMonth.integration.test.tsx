import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryStorage } from '../shared/infrastructure/memoryStorage'
import { renderApp } from '../test-utils/renderApp'

describe('Previous month', () => {
  it('is read-only: no edit or delete controls', async () => {
    renderApp({ route: '/mes-anterior' })
    expect(await screen.findByRole('heading', { name: 'Septiembre de 2026' })).toBeInTheDocument()
    expect(screen.getByText('Solo lectura')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Gastos del mes anterior' })).toBeInTheDocument()
  })

  it('shows the category summaries and the month total for the previous month', async () => {
    renderApp({ route: '/mes-anterior' })
    expect(await screen.findByTestId('previous-total')).toHaveTextContent('$ 216.700')
    expect(within(screen.getByTestId('category-card-insumos-clinicos')).getByText('$ 44.000')).toBeInTheDocument()
    expect(screen.getByTestId('category-card-medicamentos-farmacia')).toHaveAttribute('data-status', 'ok')
  })

  it('compares each category against the current month', async () => {
    renderApp({ route: '/mes-anterior' })
    const region = await screen.findByRole('region', { name: 'Comparación con el mes actual' })
    expect(within(region).getByTestId('compare-insumos-clinicos')).toHaveTextContent('+$ 34.000')
    expect(within(region).getByTestId('compare-medicamentos-farmacia')).toHaveTextContent('+$ 67.000')
    expect(within(region).getByTestId('compare-servicios')).toHaveTextContent('+$ 1.800')
    expect(within(region).getByTestId('compare-personal')).toHaveTextContent('+$ 18.000')
    expect(within(region).getByTestId('compare-total')).toHaveTextContent('+$ 120.800')
  })
})

describe('Month reset', () => {
  it('starts a new month at zero on the 1st without deleting the old data', async () => {
    const storage = new MemoryStorage()
    const first = renderApp({ storage, today: '2026-10-31' })
    expect(await screen.findByTestId('month-total')).not.toHaveTextContent('$ 0')
    first.unmount()

    renderApp({ storage, today: '2026-11-01' })
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 0')
    expect(screen.getByText('Noviembre de 2026')).toBeInTheDocument()
  })

  it('keeps the old month reachable as previous month and in history', async () => {
    const storage = new MemoryStorage()
    renderApp({ storage, today: '2026-10-31' }).unmount()
    renderApp({ storage, today: '2026-11-01', route: '/mes-anterior' })
    expect(await screen.findByRole('heading', { name: 'Octubre de 2026' })).toBeInTheDocument()
    expect(screen.getByTestId('previous-total')).not.toHaveTextContent('$ 0')
  })
})

describe('Persistence', () => {
  it('keeps added expenses after remounting with the same storage', async () => {
    const storage = new MemoryStorage()
    const first = renderApp({ storage, route: '/gastos/nuevo' })
    await first.user.selectOptions(screen.getByLabelText('Categoría'), 'personal')
    await first.user.type(screen.getByLabelText('Monto (UYU)'), '1000')
    await first.user.type(screen.getByLabelText('Descripción (opcional)'), 'Gasto persistente')
    await first.user.click(screen.getByRole('button', { name: 'Guardar gasto' }))
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 338.500')
    first.unmount()

    renderApp({ storage })
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 338.500')
  })

  it('recovers from corrupt stored data by loading the demo data', async () => {
    const storage = new MemoryStorage()
    storage.setItem('sienra.v1.expenses', '{corrupt')
    storage.setItem('sienra.v1.budgets', 'nope')
    renderApp({ storage })
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 337.500')
  })
})
