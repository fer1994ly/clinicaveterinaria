import { expect, test } from '@playwright/test'

// Checks that only make sense against the deployed site (npm run test:e2e:remote).
// They use a plain context on purpose: no faked clock, so timings and fonts are the real ones.
test.skip(!process.env.E2E_BASE_URL, 'Remote only: set E2E_BASE_URL (npm run test:e2e:remote)')

const DEEP_LINKS = ['/gastos', '/gastos/nuevo', '/mes-anterior', '/admin']

test.describe('deployment', () => {
  test('serves the security headers on the home page', async ({ request }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    const headers = response.headers()
    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['x-frame-options']?.toUpperCase()).toBe('DENY')
    expect(headers['x-content-type-options']?.toLowerCase()).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  test('caches hashed assets as immutable and revalidates the HTML shell', async ({ page, request }) => {
    await page.goto('/')
    const assets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"][href]')]
        .map((el) => ('src' in el && el.src ? el.src : (el as HTMLLinkElement).href))
        .filter((url) => new URL(url).pathname.startsWith('/assets/')),
    )
    expect(assets.some((url) => url.endsWith('.js'))).toBe(true)
    for (const url of assets) {
      const response = await request.get(url)
      expect(response.status(), url).toBe(200)
      expect(response.headers()['cache-control'], url).toContain('immutable')
    }
    const html = await request.get('/')
    // Netlify serves "/" as "public,max-age=0,must-revalidate", equivalent to no-cache for this purpose
    expect(html.headers()['cache-control']).toMatch(/no-cache|max-age=0/)
  })

  for (const route of DEEP_LINKS) {
    test(`deep link ${route} renders the app, also after a reload`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
      await expect(page.getByText('No encontramos esta página')).toHaveCount(0)
      await page.reload()
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`${route}$`))
    })
  }

  test('loads without console errors or CSP violations', async ({ page }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console: ${message.text()}`)
    })
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
    page.on('requestfailed', (request) => problems.push(`requestfailed: ${request.url()}`))
    // Netlify injects its own HUD badge into published pages; it builds an inline srcdoc iframe that
    // our (correct) CSP refuses. That noise is not ours, so the badge script is stubbed out here.
    await page.route('**/.netlify/scripts/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    )
    await page.addInitScript(() => {
      const w = window as unknown as { __cspViolations: string[] }
      w.__cspViolations = []
      document.addEventListener('securitypolicyviolation', (event) => {
        w.__cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`)
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('month-total')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: 'Mes anterior' }).click()
    await expect(page.getByText('Solo lectura')).toBeVisible()

    const violations = await page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations)
    expect(violations).toEqual([])
    expect(problems).toEqual([])
  })

  test('loads the brand fonts (Nunito and Inter) from Google Fonts', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('month-total')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family.replace(/["']/g, '')),
    )
    expect(loaded).toContain('Nunito')
    expect(loaded).toContain('Inter')
    expect(await page.evaluate(() => document.fonts.check('800 1em Nunito', 'Gastos'))).toBe(true)
    expect(await page.evaluate(() => document.fonts.check('400 1em Inter', 'Gastos'))).toBe(true)
  })

  test('finishes loading in under 3 seconds', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })
    await expect(page.getByTestId('month-total')).toBeVisible()
    const timing = await page.evaluate(() => {
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      return { loadEventEnd: navigation?.loadEventEnd ?? Number.NaN, visible: performance.now() }
    })
    expect(timing.loadEventEnd).toBeGreaterThan(0)
    expect(timing.loadEventEnd).toBeLessThan(3000)
    expect(timing.visible).toBeLessThan(3000)
  })
})
