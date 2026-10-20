import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
// When set, the suite runs against that deployed site and no local server is started.
const REMOTE_URL = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Fewer workers against the deployed site so parallel runs do not distort the load-time checks.
  workers: REMOTE_URL ? 4 : undefined,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: REMOTE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: REMOTE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-android', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-ios', use: { ...devices['iPhone 14'] } },
  ],
})
