import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryStorage } from '../shared/infrastructure/memoryStorage'
import { renderApp } from '../test-utils/renderApp'

const listItems = () => within(screen.getByRole('list', { name: 'Lista de gastos' })).getAllByRole('listitem')
const summary = () => screen.getByTestId('history-summary')

describe('Expense form cancel', () => {
  it('goes back to the previous screen when there is in-app history', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findByRole('list', { name: 'Lista de gastos' })
    await user.click(screen.getAllByRole('button', { name: /^Editar gasto:/ })[0]!)
    expect(await screen.findByRole('heading', { name: 'Editar gasto' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByRole('list', { name: 'Lista de gastos' })).toBeInTheDocument()
  })

  it('goes back to the dashboard from a directly opened new-expense form', async () => {
    const { user } = renderApp({ route: '/gastos/nuevo' })
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByTestId('month-total')).toBeInTheDocument()
  })

  it('goes back to the history from a directly opened edit form', async () => {
    const storage = new MemoryStorage()
    const first = renderApp({ route: '/', storage })
    const id = first.container.expenses.all()[0]!.id
    first.unmount()
    const { user } = renderApp({ route: `/gastos/${id}/editar`, storage })
    expect(await screen.findByRole('heading', { name: 'Editar gasto' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(await screen.findByRole('list', { name: 'Lista de gastos' })).toBeInTheDocument()
  })
})

describe('Expense form', () => {
  it('blocks submit and shows Spanish inline errors when required fields are missing', async () => {
    const { user, container } = renderApp({ route: '/gastos/nuevo' })
    const before = container.expenses.all().length
    await user.clear(screen.getByLabelText('Fecha'))
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))

    expect(await screen.findByText('Seleccione una categoría.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese un monto mayor a cero.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese una fecha válida.')).toBeInTheDocument()
    expect(screen.getByLabelText('Monto (UYU)')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('heading', { name: 'Nuevo gasto' })).toBeInTheDocument()
    expect(container.expenses.all()).toHaveLength(before)
  })

  it('clears an error once the field is corrected', async () => {
    const { user } = renderApp({ route: '/gastos/nuevo' })
    await user.click(screen.getByRole('button', { name: 'Guardar gasto' }))
    expect(await screen.findByText('Seleccione una categoría.')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Categoría'), 'personal')
    expect(screen.queryByText('Seleccione una categoría.')).not.toBeInTheDocument()
  })

  it('defaults the date to today according to the clock', () => {
    renderApp({ route: '/gastos/nuevo', today: '2026-10-07' })
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-10-07')
  })
})

describe('Editing and deleting', () => {
  it('moves the amount between categories when the category is edited', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await user.click((await screen.findAllByRole('button', { name: 'Editar gasto: Recarga de gas' }))[0]!)
    expect(screen.getByRole('heading', { name: 'Editar gasto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Monto (UYU)')).toHaveValue('5500')
    await user.selectOptions(screen.getByLabelText('Categoría'), 'personal')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await user.click(await screen.findByRole('link', { name: 'Inicio' }))
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 337.500')
    expect(within(screen.getByTestId('category-card-servicios')).getByText('$ 21.000')).toBeInTheDocument()
    expect(within(screen.getByTestId('category-card-personal')).getByText('$ 103.500')).toBeInTheDocument()
  })

  it('asks for confirmation before deleting and keeps the expense on cancel', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findByRole('list', { name: 'Lista de gastos' })
    const count = listItems().length
    await user.click(screen.getAllByRole('button', { name: 'Eliminar gasto: Recarga de gas' })[0]!)

    const dialog = screen.getByRole('dialog', { name: '¿Eliminar este gasto?' })
    expect(within(dialog).getByText(/Recarga de gas/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(listItems()).toHaveLength(count)
  })

  it('deletes after confirming and updates totals right away', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findAllByRole('listitem')
    await user.click(screen.getAllByRole('button', { name: 'Eliminar gasto: Recarga de gas' })[0]!)
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, eliminar' }))

    expect(screen.getAllByRole('button', { name: 'Eliminar gasto: Recarga de gas' })).toHaveLength(1)
    await user.click(screen.getByRole('link', { name: 'Inicio' }))
    expect(await screen.findByTestId('month-total')).toHaveTextContent('$ 332.000')
  })
})

describe('History', () => {
  it('lists every expense of every month, newest first, with count and total', async () => {
    renderApp({ route: '/gastos' })
    await screen.findAllByRole('listitem')
    expect(summary()).toHaveTextContent('30 gastos')
    const items = listItems()
    expect(items).toHaveLength(30)
    expect(items[0]).toHaveTextContent('Medicación para animales internados')
  })

  it('combines category, date range and text search', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findAllByRole('listitem')

    await user.selectOptions(screen.getByLabelText('Categoría'), 'medicamentos-farmacia')
    expect(summary()).toHaveTextContent('10 gastos')

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-31' } })
    expect(summary()).toHaveTextContent('6 gastos')
    expect(summary()).toHaveTextContent('$ 135.000')

    await user.type(screen.getByRole('searchbox', { name: 'Buscar en la descripción' }), 'ANTIBIOTICOS')
    expect(summary()).toHaveTextContent('1 gasto')
    expect(summary()).toHaveTextContent('$ 28.500')
    expect(listItems()[0]).toHaveTextContent('Antibióticos y antiinflamatorios')
  })

  it('finds accented text typed without accents', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findAllByRole('listitem')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar en la descripción' }), 'quirurgico')
    expect(listItems().length).toBeGreaterThan(0)
    listItems().forEach((li) => expect(li).toHaveTextContent(/quirúrgico/i))
  })

  it('clears all filters with one button', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findAllByRole('listitem')
    await user.selectOptions(screen.getByLabelText('Categoría'), 'servicios')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar en la descripción' }), 'luz')
    expect(summary()).toHaveTextContent('2 gastos')
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(summary()).toHaveTextContent('30 gastos')
    expect(screen.getByLabelText('Categoría')).toHaveValue('')
    expect(screen.getByRole('searchbox', { name: 'Buscar en la descripción' })).toHaveValue('')
  })

  it('explains when nothing matches and offers to clear the filters', async () => {
    const { user } = renderApp({ route: '/gastos' })
    await screen.findAllByRole('listitem')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar en la descripción' }), 'zzzz')
    expect(screen.getByText('No hay gastos que coincidan con los filtros.')).toBeInTheDocument()
    expect(summary()).toHaveTextContent('0 gastos')
  })
})
