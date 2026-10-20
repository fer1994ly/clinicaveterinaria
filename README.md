# Sienra Gastos — expense and budget control

Mobile-first web app for Clínica Veterinaria Sienra (Uruguay). It shows, at any moment of the month,
how much was spent per category against its monthly budget (amounts in UYU), and warns before the
month ends: yellow from 80% of the budget, red when it is exceeded.

Everything runs in the browser: no backend, no external services. Data lives in `localStorage`.

## Commands

```bash
npm install
npm run dev            # development server
npm run build          # typecheck + production build
npm run preview        # serve the build on http://localhost:4173
npm run typecheck
npm run lint
npm test -- --run      # Vitest + Testing Library (unit and integration)
npx playwright install chromium webkit   # once
npm run test:e2e       # Playwright: desktop-chromium, mobile-android (Pixel 7), mobile-ios (iPhone 14, WebKit)
npm run check:bundle   # fails if the production JS exceeds 150 KB gzip
```

Routing uses `BrowserRouter`. `vite preview` and `vite dev` fall back to `index.html`; any static host
must be configured with the same SPA fallback (or switch to `HashRouter` in `src/app/App.tsx`).

## Demo admin password

Budgets can only be edited at `/admin`. The demo password is `sienra2026`, defined in one place:
`src/features/admin/domain/auth.ts` (`ADMIN_PASSWORD`). The same file has `SHOW_DEMO_PASSWORD_HINT`;
set it to `false` to remove the hint shown on the login screen. The unlocked state is kept in
`sessionStorage` (it ends when the tab closes). Admin also has "Restablecer datos de ejemplo".

## Architecture

DDD vertical slices; domain code is pure TypeScript (no React, no storage).

```
src/
  shared/          domain (Money, YearMonth, Clock port, KeyValueStorage port), infrastructure
                   (localStorage / sessionStorage / in-memory adapters, SystemClock), ui (Button, Dialog, ...)
  features/
    budgets/             categories, budget status rule, monthly overview, budget repository
    expenses/            validation, add/edit/delete, history query, repository, seed, UI
    monthly-comparison/  compareMonths use case and the read-only previous month page
    admin/               password check, session, budget editor
  app/             composition root (container), providers, router, shell
```

Application functions receive repositories and the clock as parameters, so tests freeze dates and use
in-memory storage.

## How the monthly reset works

Nothing is ever deleted or reset. Monthly totals are derived: expenses whose date falls in the current
calendar month (according to the injected `Clock`). On the 1st the dashboard starts at zero while the
old expenses stay in the history and become the "Mes anterior" view. Budgets do not depend on the month.

## Seed data story

Only when storage is empty (or corrupt) the app generates demo data relative to the clock's month, so
the demo always works: this month has more surgeries, so Medicamentos y farmacia is over budget
(~112%) and Insumos clínicos is near its limit (~87%); last month was calm and within budget. This
month's expenses are placed on days up to today.

## For Kodarvia: swapping localStorage for a backend

- Storage port: `src/shared/domain/storage.ts` (`KeyValueStorage`), adapters in `src/shared/infrastructure`.
- The repositories (`LocalExpenseRepository`, `LocalBudgetRepository`) implement ports declared in each
  slice's `domain/ports.ts`; implement those against an API and swap them in `src/app/container.ts`
  (the only place concrete adapters are chosen). Repositories are synchronous today; an async backend
  needs the ports and hooks in `src/app/AppProviders.tsx` to become async.
- Replace the admin password check (`src/features/admin/domain/auth.ts`) with real authentication.
