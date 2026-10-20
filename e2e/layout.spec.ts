import { expect, test } from './fixtures'

const ROUTES = ['/', '/gastos', '/gastos/nuevo', '/mes-anterior', '/clinica', '/admin']
const SCROLLING_ROUTES = ['/', '/gastos', '/mes-anterior', '/clinica']

test.describe('layout', () => {
  for (const route of ROUTES) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
      await page.goto(route)
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
      await page.waitForLoadState('networkidle')
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
    })
  }

  test('no horizontal overflow at 360px width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    for (const route of ROUTES) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth, route).toBeLessThanOrEqual(clientWidth)
    }
  })

  for (const route of SCROLLING_ROUTES) {
    test(`fixed controls never cover the last content on ${route}`, async ({ page }) => {
      await page.goto(route)
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(150)

      const last = await page.locator('main > div > *').last().boundingBox()
      const nav = await page.getByRole('navigation', { name: 'Navegación principal' }).boundingBox()
      const fab = await page.getByRole('link', { name: 'Nuevo gasto' }).boundingBox()
      expect(last).not.toBeNull()
      expect(nav).not.toBeNull()
      expect(fab).not.toBeNull()

      const bottom = last!.y + last!.height
      const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
        a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
      // the last block must end above both fixed controls
      expect(bottom).toBeLessThanOrEqual(nav!.y)
      expect(bottom).toBeLessThanOrEqual(fab!.y)
      expect(overlaps(fab!, nav!)).toBe(false)
    })
  }

  test('tap targets are at least 44px tall', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('month-total')).toBeVisible()
    const targets = [
      page.getByRole('link', { name: 'Nuevo gasto' }),
      page.getByRole('link', { name: 'Inicio' }),
      page.getByRole('link', { name: 'Gastos', exact: true }),
      page.getByRole('link', { name: 'Mes anterior' }),
      page.getByRole('link', { name: 'Clínica', exact: true }),
      page.getByRole('link', { name: 'Admin' }),
    ]
    for (const target of targets) {
      const box = await target.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })
})
