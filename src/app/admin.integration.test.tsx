import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryStorage } from '../shared/infrastructure/memoryStorage'
import { renderApp } from '../test-utils/renderApp'

async function login(user: ReturnType<typeof renderApp>['user'], password = 'sienra2026') {
  await user.type(await screen.findByLabelText('Clave de administración'), password)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('Admin access', () => {
  it('is reachable from the main navigation', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('link', { name: 'Admin' }))
    expect(await screen.findByLabelText('Clave de administración')).toBeInTheDocument()
  })

  it('asks for the password and does not render the budget editor before it', async () => {
    renderApp({ route: '/admin' })
    expect(await screen.findByLabelText('Clave de administración')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: /Presupuesto de/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Presupuesto de Personal')).not.toBeInTheDocument()
  })

  it('shows the demo password hint on the login screen', async () => {
    renderApp({ route: '/admin' })
    expect(await screen.findByText('Clave de demostración: sienra2026')).toBeInTheDocument()
  })

  it('rejects a wrong password with an inline error', async () => {
    const { user } = renderApp({ route: '/admin' })
    await login(user, 'incorrecta')
    expect(await screen.findByText('La clave es incorrecta. Intente nuevamente.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Presupuesto de Personal')).not.toBeInTheDocument()
  })

  it('unlocks with the right password and can log out', async () => {
    const { user } = renderApp({ route: '/admin' })
    await login(user)
    expect(await screen.findByLabelText('Presupuesto de Personal')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByLabelText('Clave de administración')).toBeInTheDocument()
    expect(screen.queryByLabelText('Presupuesto de Personal')).not.toBeInTheDocument()
  })

  it('keeps the session across remounts with the same session storage', async () => {
    const sessionStorage = new MemoryStorage()
    const first = renderApp({ route: '/admin', sessionStorage })
    await login(first.user)
    await screen.findByLabelText('Presupuesto de Personal')
    first.unmount()
    renderApp({ route: '/admin', sessionStorage })
    expect(await screen.findByLabelText('Presupuesto de Personal')).toBeInTheDocument()
  })
})

describe('Budget editor', () => {
  it('changes the dashboard status when a budget is edited', async () => {
    const { user } = renderApp({ route: '/admin' })
    await login(user)
    const field = await screen.findByLabelText('Presupuesto de Medicamentos y farmacia')
    await user.clear(field)
    await user.type(field, '200000')
    await user.click(screen.getByRole('button', { name: 'Guardar presupuesto de Medicamentos y farmacia' }))
    expect(await screen.findByText('Presupuesto actualizado.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Inicio' }))
    const card = await screen.findByTestId('category-card-medicamentos-farmacia')
    expect(card).toHaveAttribute('data-status', 'ok')
    expect(within(card).getByText('$ 200.000')).toBeInTheDocument()
  })

  it('can push a category into exceeded by lowering its budget', async () => {
    const { user } = renderApp({ route: '/admin' })
    await login(user)
    const field = await screen.findByLabelText('Presupuesto de Personal')
    await user.clear(field)
    await user.type(field, '90000')
    await user.click(screen.getByRole('button', { name: 'Guardar presupuesto de Personal' }))
    await user.click(screen.getByRole('link', { name: 'Inicio' }))
    expect(await screen.findByTestId('category-card-personal')).toHaveAttribute('data-status', 'exceeded')
  })

  it.each(['0', '-5', 'abc', '12,5', ''])('rejects the budget %j', async (value) => {
    const { user, container } = renderApp({ route: '/admin' })
    await login(user)
    const field = await screen.findByLabelText('Presupuesto de Servicios (luz, agua, gas)')
    await user.clear(field)
    if (value) await user.type(field, value)
    await user.click(screen.getByRole('button', { name: 'Guardar presupuesto de Servicios (luz, agua, gas)' }))
    expect(await screen.findByText('Ingrese un número entero positivo.')).toBeInTheDocument()
    expect(container.budgets.getAll().servicios).toBe(35000)
  })
})

describe('Reset demo data', () => {
  it('asks for confirmation and keeps data on cancel', async () => {
    const { user, container } = renderApp({ route: '/admin' })
    await login(user)
    container.expenses.replaceAll([])
    await user.click(await screen.findByRole('button', { name: 'Restablecer datos de ejemplo' }))
    const dialog = screen.getByRole('dialog', { name: '¿Restablecer los datos de ejemplo?' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(container.expenses.all()).toHaveLength(0)
  })

  it('restores the demo expenses and budgets after confirming', async () => {
    const { user, container } = renderApp({ route: '/admin' })
    await login(user)
    container.expenses.replaceAll([])
    container.budgets.set('personal', 1000)
    await user.click(await screen.findByRole('button', { name: 'Restablecer datos de ejemplo' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, restablecer' }))
    expect(container.expenses.all().length).toBeGreaterThan(20)
    expect(container.budgets.getAll().personal).toBe(150000)
    expect(await screen.findByText('Datos de ejemplo restablecidos.')).toBeInTheDocument()
  })
})
