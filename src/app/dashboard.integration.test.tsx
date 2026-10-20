import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test-utils/renderApp'

const card = (id: string) => screen.getByTestId(`category-card-${id}`)

describe('Dashboard', () => {
  it('shows the monthly grand total and the four category cards with their status', async () => {
    renderApp()
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 337.500')
    expect(screen.getByText('Octubre de 2026')).toBeInTheDocument()

    expect(card('medicamentos-farmacia')).toHaveAttribute('data-status', 'exceeded')
    expect(card('insumos-clinicos')).toHaveAttribute('data-status', 'warning')
    expect(card('servicios')).toHaveAttribute('data-status', 'ok')
    expect(card('personal')).toHaveAttribute('data-status', 'ok')
  })

  it('marks an exceeded category very visibly and caps its bar at 100%', async () => {
    renderApp()
    await screen.findByTestId('month-total')
    const med = within(card('medicamentos-farmacia'))
    expect(med.getByText('Presupuesto excedido')).toBeInTheDocument()
    expect(med.getByText(/Excedido por \$ 15\.000/)).toBeInTheDocument()
    expect(med.getByText('$ 120.000')).toBeInTheDocument()
    expect(med.getByText('$ 135.000')).toBeInTheDocument()
    const bar = med.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '100')
    expect(bar.firstElementChild).toHaveStyle({ width: '100%' })
  })

  it('shows remaining budget for categories within it', async () => {
    renderApp()
    await screen.findByTestId('month-total')
    const servicios = within(card('servicios'))
    expect(servicios.getByText(/Quedan \$ 8\.500/)).toBeInTheDocument()
    expect(servicios.queryByText('Presupuesto excedido')).not.toBeInTheDocument()
  })

  it('updates the card and the grand total without reload when an expense is added', async () => {
    const { user } = renderApp()
    await screen.findByTestId('month-total')
    await user.click(screen.getByRole('link', { name: 'Nuevo gasto' }))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'servicios')
    await user.type(screen.getByLabelText('Monto (UYU)'), '5000')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-20' } })
    await user.type(screen.getByLabelText('Descripción (opcional)'), 'Reparación de bomba de agua')
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))

    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 342.500')
    const servicios = within(card('servicios'))
    expect(servicios.getByText('$ 31.500')).toBeInTheDocument()
    expect(card('servicios')).toHaveAttribute('data-status', 'warning')
  })

  it('does not count expenses from other months in the grand total', async () => {
    const { user } = renderApp()
    await screen.findByTestId('month-total')
    await user.click(screen.getByRole('link', { name: 'Nuevo gasto' }))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'servicios')
    await user.type(screen.getByLabelText('Monto (UYU)'), '5000')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-09-20' } })
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 337.500')
  })

  it('lists the latest expenses with a link to the full history', async () => {
    const { user } = renderApp()
    await screen.findByTestId('month-total')
    const latest = screen.getByRole('region', { name: 'Últimos gastos' })
    expect(within(latest).getAllByRole('listitem')).toHaveLength(5)
    await user.click(within(latest).getByRole('link', { name: 'Ver todos' }))
    expect(await screen.findByRole('heading', { name: 'Historial de gastos' })).toBeInTheDocument()
  })
})
