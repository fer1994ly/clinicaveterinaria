import { test as plainTest } from '@playwright/test'
import { addExpense, expect, isRemote, test } from './fixtures'

test.describe('acceptance criteria', () => {
  test('dashboard shows the month total and one card per category', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('month-total')).toHaveText('$ 337.500')
    await expect(page.getByRole('heading', { name: 'Octubre de 2026' })).toBeVisible()
    for (const id of ['insumos-clinicos', 'medicamentos-farmacia', 'servicios', 'personal']) {
      await expect(page.getByTestId(`category-card-${id}`)).toBeVisible()
    }
  })

  test('a category over budget is visibly marked as exceeded', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('category-card-medicamentos-farmacia')
    await expect(card).toHaveAttribute('data-status', 'exceeded')
    await expect(card.getByText('Presupuesto excedido')).toBeVisible()
    await expect(card.getByText('Excedido por $ 15.000')).toBeVisible()
    await expect(card).toHaveCSS('border-top-color', 'rgb(214, 69, 69)')
    await expect(page.getByTestId('category-card-insumos-clinicos')).toHaveAttribute('data-status', 'warning')
    await expect(page.getByTestId('category-card-servicios')).toHaveAttribute('data-status', 'ok')
  })

  test('adding an expense updates the total and the card without reloading', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      ;(window as unknown as { __noReload: boolean }).__noReload = true
    })
    await addExpense(page, { category: 'servicios', amount: '5000', date: '2026-10-20', description: 'Reparación de bomba' })

    await expect(page.getByTestId('month-total')).toHaveText('$ 342.500')
    await expect(page.getByTestId('category-card-servicios')).toContainText('$ 31.500')
    await expect(page.getByTestId('category-card-servicios')).toHaveAttribute('data-status', 'warning')
    const stillThere = await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)
    expect(stillThere).toBe(true)
  })

  test('the expense form does not submit when required fields are missing', async ({ page }) => {
    await page.goto('/gastos/nuevo')
    await page.getByRole('button', { name: 'Guardar gasto' }).click()
    await expect(page.getByText('Seleccione una categoría.')).toBeVisible()
    await expect(page.getByText('Ingrese un monto mayor a cero.')).toBeVisible()
    await expect(page).toHaveURL(/\/gastos\/nuevo$/)

    await page.getByLabel('Categoría').selectOption('personal')
    await page.getByRole('button', { name: 'Guardar gasto' }).click()
    await expect(page.getByText('Ingrese un monto mayor a cero.')).toBeVisible()
    await expect(page).toHaveURL(/\/gastos\/nuevo$/)

    await page.getByLabel('Monto (UYU)').fill('1000')
    await page.getByRole('button', { name: 'Guardar gasto' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('data survives a reload and a brand new page in the same browser', async ({ page, context }) => {
    await page.goto('/')
    await addExpense(page, { category: 'personal', amount: '2000', description: 'Gasto que debe persistir' })
    await expect(page.getByTestId('month-total')).toHaveText('$ 339.500')

    await page.reload()
    await expect(page.getByTestId('month-total')).toHaveText('$ 339.500')

    await page.close()
    const reopened = await context.newPage()
    await reopened.goto('/gastos')
    await expect(reopened.getByRole('list', { name: 'Lista de gastos' })).toContainText('Gasto que debe persistir')
    await reopened.getByRole('link', { name: 'Inicio' }).click()
    await expect(reopened.getByTestId('month-total')).toHaveText('$ 339.500')
  })

  test('admin asks for the password before showing the budget editor', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByLabel('Clave de administración')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Presupuesto de Personal' })).toHaveCount(0)

    await page.getByLabel('Clave de administración').fill('incorrecta')
    await page.getByRole('button', { name: 'Ingresar' }).click()
    await expect(page.getByText('La clave es incorrecta. Intente nuevamente.')).toBeVisible()

    await page.getByLabel('Clave de administración').fill('sienra2026')
    await page.getByRole('button', { name: 'Ingresar' }).click()
    await expect(page.getByRole('textbox', { name: 'Presupuesto de Personal' })).toBeVisible()

    const field = page.getByRole('textbox', { name: 'Presupuesto de Personal' })
    await field.fill('90000')
    await page.getByRole('button', { name: 'Guardar presupuesto de Personal' }).click()
    await expect(page.getByText('Presupuesto actualizado.')).toBeVisible()

    await page.getByRole('link', { name: 'Inicio' }).click()
    await expect(page.getByTestId('category-card-personal')).toHaveAttribute('data-status', 'exceeded')

    await page.getByRole('link', { name: 'Admin' }).click()
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page.getByLabel('Clave de administración')).toBeVisible()
  })
})

test.describe('everyday flows', () => {
  test('deleting asks for confirmation inside the app', async ({ page }) => {
    await page.goto('/gastos')
    const list = page.getByRole('list', { name: 'Lista de gastos' })
    // wait for the list to render before reading the baseline (count() does not retry)
    await expect(list.getByRole('listitem').first()).toBeVisible()
    const before = await list.getByRole('listitem').count()
    await page.getByRole('button', { name: 'Eliminar gasto: Medicación para animales internados' }).click()
    const dialog = page.getByRole('dialog', { name: '¿Eliminar este gasto?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(list.getByRole('listitem')).toHaveCount(before)

    await page.getByRole('button', { name: 'Eliminar gasto: Medicación para animales internados' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Sí, eliminar' }).click()
    await expect(list.getByRole('listitem')).toHaveCount(before - 1)
  })

  test('history filters combine and can be cleared', async ({ page }) => {
    await page.goto('/gastos')
    const summary = page.getByTestId('history-summary')
    await expect(summary).toContainText('30 gastos')
    await page.getByLabel('Categoría').selectOption('medicamentos-farmacia')
    await page.getByLabel('Desde').fill('2026-10-01')
    await page.getByLabel('Hasta').fill('2026-10-31')
    await expect(summary).toContainText('6 gastos')
    await expect(summary).toContainText('$ 135.000')
    await page.getByRole('searchbox', { name: 'Buscar en la descripción' }).fill('ANTIBIOTICOS')
    await expect(summary).toContainText('1 gasto')
    await page.getByRole('button', { name: 'Limpiar filtros' }).click()
    await expect(summary).toContainText('30 gastos')
  })

  test('previous month is read-only and compares with the current one', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Mes anterior' }).click()
    await expect(page.getByRole('heading', { name: 'Septiembre de 2026', exact: true })).toBeVisible()
    await expect(page.getByText('Solo lectura')).toBeVisible()
    await expect(page.getByRole('button', { name: /Editar|Eliminar/ })).toHaveCount(0)
    await expect(page.getByTestId('compare-medicamentos-farmacia')).toContainText('+$ 67.000')
  })
})

// No faked clock here: Playwright's clock hides the navigation entries and distorts timings.
// Metrics come from the browser itself (performance.now() counts from navigation start).
plainTest.describe('performance', () => {
  plainTest('the first screen is ready quickly', async ({ page }) => {
    if (!isRemote) await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('month-total')).toBeVisible()
    const metrics = await page.evaluate(() => {
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd ?? Number.NaN,
        contentVisible: performance.now(),
      }
    })
    // generous thresholds; the bundle size budget is enforced by `npm run check:bundle`
    expect(metrics.domContentLoaded).toBeGreaterThan(0)
    expect(metrics.domContentLoaded).toBeLessThan(3000)
    expect(metrics.contentVisible).toBeLessThan(3000)
  })
})
