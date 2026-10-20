import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FailingStorage } from '../test-utils/failingStorage'
import { renderApp } from '../test-utils/renderApp'

const MESSAGE = 'No se pudo guardar. Verifique el espacio disponible del navegador.'

describe('Storage write failures', () => {
  it('shows a non-blocking error and keeps the app working in memory', async () => {
    const storage = new FailingStorage()
    const { user } = renderApp({ route: '/gastos/nuevo', storage })

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGE)

    await user.selectOptions(screen.getByLabelText('Categoría'), 'servicios')
    await user.type(screen.getByLabelText('Monto (UYU)'), '5000')
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))

    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 342.500')
    expect(screen.getByText(MESSAGE)).toBeInTheDocument()
  })

  it('can be dismissed and disappears after a successful write', async () => {
    const storage = new FailingStorage()
    const { user } = renderApp({ route: '/', storage })
    await user.click(await screen.findByRole('button', { name: 'Cerrar aviso' }))
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument()

    storage.failWrites = true
    await user.click(screen.getByRole('link', { name: 'Nuevo gasto' }))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'personal')
    await user.type(screen.getByLabelText('Monto (UYU)'), '1000')
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument()

    storage.failWrites = false
    await user.click(screen.getByRole('link', { name: 'Nuevo gasto' }))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'personal')
    await user.type(screen.getByLabelText('Monto (UYU)'), '2000')
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))
    await screen.findByTestId('month-total')
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument()
  })

  it('does not show the error when writes work', async () => {
    renderApp({ route: '/' })
    await screen.findByTestId('month-total')
    expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument()
  })
})
