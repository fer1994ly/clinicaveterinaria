# Feature: Expense & Budget Control — Clínica Veterinaria Sienra

## Objective
Mobile-first React app (localStorage only) so the clinic sees, at any moment of the month, spent vs. budget per category and gets warned before month end.

## Problem / Why
The clinic tracks expenses from memory and finds out about overspending (e.g. a month with more surgeries) only at month end, when nothing can be adjusted.

## Scope (authorized)
- Category list (Insumos clínicos $90.000, Medicamentos y farmacia $120.000, Servicios (luz, agua, gas) $35.000, Personal $150.000 — UYU) with monthly budget, spent, progress bar; yellow at >=80%, red when >100%.
- Monthly grand total at the top of the dashboard; recalculated live on add/edit/delete.
- Expense create (required: category, amount > 0, date), edit, delete with confirmation.
- History: filter by category + date range (combinable) + text search by description.
- Automatic monthly reset: monthly totals derive from the calendar month of each expense; history is never deleted; budgets do not change with the month.
- Read-only previous-month view for comparison.
- Admin panel behind a password (demo password `sienra2026`); budget editing only there.
- Realistic seed data relative to the current month: 15–20 current-month expenses (Medicamentos > 100%, Insumos between 80–100%), plus previous-month expenses.
- No backend, no external services, no lorem ipsum, every button wired.

## Constraints
- Stack: React + Vite + TypeScript + Tailwind CSS + react-router-dom, localStorage.
- Brand: #7FC7D9 (clinic blue), #FFFFFF, #6FAE7B (health green), #1B2A2E (ink). Nunito (headings), Inter (body). No stock imagery.
- Mobile first; no clipped elements or hidden buttons on phones. Load < 3 s on 4G (small bundle, no heavy deps).
- Architecture: DDD vertical slices (`src/features/<slice>/{domain,application,infrastructure,ui}`), shared kernel in `src/shared`. Clock and storage injected for testability.
- Generated artifacts (code, tests, docs) in English; UI copy in neutral Spanish (Uruguay context, UYU formatting).

## TDD
- Mode: strict (source: user request "AI TDD" + global config "Strict TDD Mode: enabled").
- Runners: Vitest + Testing Library (unit, integration), Playwright (E2E) with projects `desktop-chromium` and `mobile` (Pixel 7 + iPhone 14 emulation).
- RED → GREEN → REFACTOR per task.

## Delivery
- Strategy: ask-on-risk. Forecast > 400 authored lines → chain strategy to be asked before PR creation (no PR is created without user decision).
- Branch: `feat/expense-budget-control`. Work-unit commits per task, Conventional Commits, no AI attribution.

## Tasks
- [x] T1 Scaffold: Vite + React + TS + Tailwind + Vitest + Playwright configs, brand tokens, fonts, shared kernel (money, month/clock, storage port + localStorage adapter). Route: delegated.
- [x] T2 Budgets slice domain/application: Category, budget status (ok/warning/exceeded), category summaries per month, monthly total. Unit tests. Route: delegated.
- [x] T3 Expenses slice domain/application/infrastructure: Expense validation, add/edit/delete, history query (category + date range + search), localStorage repository, seed data. Unit + integration tests. Route: delegated.
- [x] T4 UI: dashboard (total + category cards + progress bars + alerts), expense form (create/edit), history with filters/search, delete confirmation, previous-month read-only view, mobile navigation. Integration tests (RTL). Route: delegated.
- [x] T5 Admin slice: password gate (session-scoped), budget editing. Unit + integration tests. Route: delegated.
- [x] T6 E2E (web + mobile): acceptance criteria scenarios, persistence after reload, no horizontal overflow on mobile. README with run instructions. Route: delegated.
- [x] T7 Delivery prep: no console.* anywhere in source/scripts (ESLint no-console enforced), comprehensive README, Netlify deployment config (netlify.toml, SPA fallback, cache headers, Node version). Route: delegated (README + config + script = 2+ files).
- [x] T8 Native review per work-unit commit (T1..T7), each in its own worktree; user chose option A on 2026-10-20. Route: native review.
- [ ] T9 Rename branch to main, add remote origin https://github.com/fer1994ly/clinicaveterinaria.git, push (user-authorized 2026-10-20).

## Acceptance criteria
- Adding an expense updates its category total without reload.
- A category over budget is visibly marked as exceeded.
- Expense form does not submit if a required field is missing.
- Data survives browser reload / tab reopen.
- All screens work on mobile, nothing clipped or covered.
- Admin panel asks for the password before editing budgets.
- Production bundle small enough for < 3 s load on 4G.

## Applicable checks
`npm run typecheck`, `npm run lint`, `npm test` (Vitest), `npm run test:e2e` (Playwright), `npm run build`.

## Progress / Evidence
- Route trigger evidence: greenfield, 20+ files to write → writer trigger fired → one delegated writer.
- (commits and check results recorded per task below)

## Next step
T9 push; then optional follow-ups from review warnings (user decision).

### T1 (commit 918958e)
- RED: 5 test files failed with `Failed to resolve import "./money" / "./yearMonth" / "./clock" / "./formatters" / storage adapters` (modules did not exist yet).
- GREEN: 21 tests pass. Checks: typecheck, lint, build OK; `check:bundle` 45.1 KB gzip.

### T2
- RED: 4 test files failed (`Failed to resolve import` for budgetStatus, categorySummary, getMonthlyOverview, updateBudget/localBudgetRepository).
- GREEN: 45 tests pass; typecheck + lint clean.

### T3
- RED: 5 test files failed (`Failed to resolve import` for validateExpense, queryHistory, add/edit/deleteExpense, localExpenseRepository, seed).
- GREEN: 111 tests pass (14 files); typecheck + lint clean. Seed verified for clocks on days 1, 3, 20, 31 and Feb/Mar.

### T4
- RED: 4 new files failed to import (`app/AppProviders`, `compareMonths`, ...) and `LocalBudgetRepository > returns a stable snapshot until the budgets change` failed on the assertion (getAll returned a new object each call).
- GREEN: 140 tests pass (18 files); typecheck, lint, build clean; `check:bundle` 64.0 KB gzip.
- Note: nav has Inicio / Gastos / Mes anterior; the Admin tab is added in T5.

### T5
- RED: `auth.test.ts` and `adminAccess.test.ts` failed to import (modules missing); 15 tests in `admin.integration.test.tsx` failed (no Admin link/route, no password screen).
- GREEN: 168 tests pass (21 files); typecheck, lint, build clean.

### T6
- E2E written after the implementation (characterization of acceptance criteria). First run observed 9 failures (3 specs x 3 projects): strict-mode heading locator, `getByLabel` also matching a button aria-label, and `performance.getEntriesByType('navigation')` empty under the faked clock; specs corrected, then 60/60 pass (desktop-chromium, mobile-android, mobile-ios on real WebKit).
- Final checks: typecheck, lint, 168 Vitest tests, build, `check:bundle` 65.7 KB gzip, `test:e2e` 60 passed.

### T7
- RED: added `no-console: error` to `eslint.config.js`; `npm run lint` failed with 4 errors (`Unexpected console statement`) in `scripts/check-bundle.mjs` lines 13, 21, 24, 26. GREEN: replaced with `process.stdout.write` / `process.stderr.write` (exit codes unchanged); lint clean.
- Added `netlify.toml` (build, Node 22, SPA redirect, cache and security headers incl. CSP checked against index.html: one module script, Google Fonts only), `.nvmrc` (22), `engines.node >=20`, full Spanish README.
- Checks: lint, typecheck, 168 Vitest tests (21 files), build, `check:bundle` 65.7 KB gzip, `test:e2e` 60 passed; `git grep "console\."` empty. Commit hash is reported by the delivery log (`git log --grep "Netlify"`).

### T8
- Whole-branch review refused (lens_context_budget_exceeded, 9906 lines); user chose per-commit review. Each commit reviewed in its own detached worktree, base = previous commit (T1 base = empty tree). User granted consent for all 7.
- Outcomes: T1 918958e, T2 0e3a1b0, T3 a9b105c, T4 625cd75, T6 cc99ecf, T7 d8a232e approved (1 lens each); T5 41f4ef0 high risk, approved (4 lenses). All acknowledged, authority burned. No blocking findings.
- Informational follow-ups (not fixed, pending user decision): parseAmount accepts "1500.50" as 150050 (money.ts); BudgetEditor rows stale after demo reset; storage write failures unhandled and invalid records silently dropped on next write; whole budget map falls back to defaults if one value is corrupt; form Cancel uses navigate(-1) on direct entry; month rollover not re-rendered while the page stays open; admin gate is client-side only (by design for demo); E2E delete count race and wall-clock perf flakiness; CSP not tested outside Netlify.
