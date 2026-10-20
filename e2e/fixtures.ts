import { test as base, expect, type Page } from '@playwright/test'

/** Every scenario runs on Tuesday 20 October 2026 so seed data and totals are deterministic. */
export const NOW = new Date(2026, 9, 20, 12, 0, 0)

/** True when the suite targets the deployed site (npm run test:e2e:remote). */
export const isRemote = Boolean(process.env.E2E_BASE_URL)

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.clock.setFixedTime(NOW)
    // Locally, fonts come from Google Fonts and tests must not depend on the network.
    // Against the deployed site they are part of production, so they load for real.
    if (!isRemote) await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
    await use(context)
  },
})

export { expect }

export async function addExpense(
  page: Page,
  data: { category: string; amount: string; date?: string; description?: string },
) {
  await page.getByRole('link', { name: 'Nuevo gasto' }).click()
  await page.getByLabel('Categoría').selectOption(data.category)
  await page.getByLabel('Monto (UYU)').fill(data.amount)
  if (data.date) await page.getByLabel('Fecha').fill(data.date)
  if (data.description) await page.getByLabel('Descripción (opcional)').fill(data.description)
  await page.getByRole('button', { name: 'Guardar gasto' }).click()
}
