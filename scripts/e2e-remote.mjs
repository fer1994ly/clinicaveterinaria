// Runs the Playwright suite against the deployed site (no local server is started).
// Usage: npm run test:e2e:remote [-- <extra playwright args>]
// Override the target with E2E_BASE_URL.
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const DEFAULT_URL = 'https://clinicaveterinariagastos.netlify.app'
const baseUrl = process.env.E2E_BASE_URL || DEFAULT_URL

const require = createRequire(import.meta.url)
const playwrightCli = require.resolve('@playwright/test/cli')

process.stdout.write(`Running E2E against ${baseUrl}\n`)

const child = spawn(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, E2E_BASE_URL: baseUrl },
})

child.on('error', (error) => {
  process.stderr.write(`Could not start Playwright: ${error.message}\n`)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.stderr.write(`Playwright stopped by signal ${signal}\n`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})
