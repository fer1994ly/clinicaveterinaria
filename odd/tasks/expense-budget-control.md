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
- [ ] T3 Expenses slice domain/application/infrastructure: Expense validation, add/edit/delete, history query (category + date range + search), localStorage repository, seed data. Unit + integration tests. Route: delegated.
- [ ] T4 UI: dashboard (total + category cards + progress bars + alerts), expense form (create/edit), history with filters/search, delete confirmation, previous-month read-only view, mobile navigation. Integration tests (RTL). Route: delegated.
- [ ] T5 Admin slice: password gate (session-scoped), budget editing. Unit + integration tests. Route: delegated.
- [ ] T6 E2E (web + mobile): acceptance criteria scenarios, persistence after reload, no horizontal overflow on mobile. README with run instructions. Route: delegated.

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
T3.

### T1 (commit 918958e)
- RED: 5 test files failed with `Failed to resolve import "./money" / "./yearMonth" / "./clock" / "./formatters" / storage adapters` (modules did not exist yet).
- GREEN: 21 tests pass. Checks: typecheck, lint, build OK; `check:bundle` 45.1 KB gzip.

### T2
- RED: 4 test files failed (`Failed to resolve import` for budgetStatus, categorySummary, getMonthlyOverview, updateBudget/localBudgetRepository).
- GREEN: 45 tests pass; typecheck + lint clean.
