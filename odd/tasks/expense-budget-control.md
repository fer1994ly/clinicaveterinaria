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
- [x] T9 Rename branch to main, add remote origin https://github.com/fer1994ly/clinicaveterinaria.git, push (user-authorized 2026-10-20).
- [x] T10 Fix review warnings: parseAmount decimals, BudgetEditor stale after reset, storage write failure handling, no silent record drop, per-category budget corruption fallback, Cancel fallback on direct entry, month rollover re-render, E2E count race + perf flakiness. Route: delegated (multi-file).
- [x] T11 Remote E2E against https://clinicaveterinariagastos.netlify.app (desktop + mobile): Playwright base URL override, CSP/headers/fonts check, load-time check; push to origin main (user-requested 2026-10-20) so Netlify redeploys. Route: delegated config + parent run.
- [x] T12 Clinic info page (scope addition requested by user 2026-10-20): route `/clinica` linked from main navigation, showing what the clinic does, address (Román Guerra 721 esq. Arturo Santana, Maldonado), phone 4223 1258, Google Maps link and Facebook link (https://www.facebook.com/clinicaveterinaria.sienra/). External links only (no iframe, CSP unchanged). Opening hours omitted: directory sources disagree. Branch `feat/clinic-info-page`. Route: delegated (writer trigger: page + route + nav + tests = 2+ non-trivial files).

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

T12 is committed on `feat/clinic-info-page`; the branch is ready for the user to decide push / PR (nothing pushed).

Previous: T11: parent pushes `main` to origin so Netlify redeploys, waits for the deploy, then re-runs `npm run test:e2e:remote` (config and `e2e/deployment.spec.ts` are ready).

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
- Checks: lint, typecheck, 168 Vitest tests (21 files), build, `check:bundle` 65.7 KB gzip, `test:e2e` 60 passed; `git grep "console."` shows only 2 prose mentions (README lint section, this doc), no code calls. Commit d8a232e.

### T8
- Whole-branch review refused (lens_context_budget_exceeded, 9906 lines); user chose per-commit review. Each commit reviewed in its own detached worktree, base = previous commit (T1 base = empty tree). User granted consent for all 7.
- Outcomes: T1 918958e, T2 0e3a1b0, T3 a9b105c, T4 625cd75, T6 cc99ecf, T7 d8a232e approved (1 lens each); T5 41f4ef0 high risk, approved (4 lenses). All acknowledged, authority burned. No blocking findings.
- Informational follow-ups (not fixed, pending user decision): parseAmount accepts "1500.50" as 150050 (money.ts); BudgetEditor rows stale after demo reset; storage write failures unhandled and invalid records silently dropped on next write; whole budget map falls back to defaults if one value is corrupt; form Cancel uses navigate(-1) on direct entry; month rollover not re-rendered while the page stays open; admin gate is client-side only (by design for demo); E2E delete count race and wall-clock perf flakiness; CSP not tested outside Netlify.

### T9
- Branch renamed to `main`, remote `origin` = https://github.com/fer1994ly/clinicaveterinaria.git, `git push -u origin main` succeeded (new branch main).

### T10 (commits ebb0fcd, f4d2ad3, 534e980, 406e51e, 04367a9)
Each claim was verified in code before fixing. RED was observed before every fix (Vitest unless noted).
1. parseAmount (ebb0fcd): RED 12 failures (`money.test.ts` 8: "1500.50", "1.5", "1.50", "1500.500", "12.34.567", ".500", "1.5000" were accepted, `hasDecimalPart` missing; `validateExpense.test.ts` 4: decimals gave the generic message). GREEN: dot is a thousands separator only in valid groups of three; decimals rejected with "Ingrese un monto en pesos, sin decimales." (expense form and budget editor). The amount input was already `type="text" inputMode="numeric"`, unchanged. The decimal UI test in `admin.integration.test.tsx` was added after the implementation (not RED; the domain RED covers it).
2. BudgetEditor stale rows (ebb0fcd): RED 2 failures in `admin.integration.test.tsx` (inputs kept the pre-reset value, '1000' instead of '150000'). Fix: the row re-syncs its text when the stored budget changes (derived state during render, keeps the "saved" status). A dirty row whose stored value did not change is intentionally left alone.
3. Storage write failure (f4d2ad3): RED 12 failures across `storage.test.ts`, repo tests, `storageError.integration.test.tsx` (`StorageWriteError` missing). `LocalStorageAdapter.setItem` now throws `StorageWriteError`; both repositories catch it, keep the data in memory (`unsaved`), notify subscribers and a `WriteObserver` (`StorageStatus` in the container) so `StorageErrorBanner` shows "No se pudo guardar. Verifique el espacio disponible del navegador." (non-blocking, dismissible, cleared by the next successful write). Unsaved data is persisted by the next successful write.
4. Silent record drop (f4d2ad3): unreadable records (or the raw string when the JSON is corrupt) are copied to `sienra.v1.expenses.quarantine` before the main key is overwritten, deduplicated; if the quarantine write fails the main key is left untouched.
5. Budget guard (f4d2ad3): per-category fallback; valid values are kept and only invalid ones default.
6. Cancel (534e980): RED 2 failures (direct-entry new and edit forms did not leave the page). Fix: `location.key === 'default'` means direct entry, so Cancel navigates (replace) to `/` (new) or `/gastos` (edit); in-app history still uses `navigate(-1)`.
7. Month rollover (406e51e): RED 3 failures in `monthRollover.integration.test.tsx` (heading stayed "Octubre de 2026" after the clock moved to Nov 1). `useToday` is now state fed by a timer to the next local midnight (+1 s) plus `visibilitychange` and `focus`; `useCurrentMonth` derives from it; timers and listeners are cleaned up (test asserts no pending timers after unmount). Verified Oct 31 -> Nov 1 with fake timers: heading "Noviembre de 2026", total "$ 0".
8. E2E (04367a9): delete test now waits for `list.first()` to be visible before reading the baseline. The performance test no longer uses Node wall-clock: it runs without Playwright's faked clock and reads `navigation.domContentLoadedEventEnd` and `performance.now()` at the first visible content (< 3000 ms each). These two were E2E changes made without an observed RED (race/flake fixes cannot be forced red deterministically).
- Repo note: `src/**` files are committed with CRLF in this repo (existing convention); new files follow it. `e2e/*.ts` (except `acceptance.spec.ts`), config files and scripts are LF.
- Checks: `npm run lint` clean; `npm run typecheck` clean; `npm test -- --run` 23 files / 209 tests pass; `npm run build` OK; `npm run check:bundle` 66.6 KB gzip (limit 150); `npm run test:e2e` 60 passed, 27 skipped (deployment spec is remote-only).

### T11 (config part, commit 224e3cb; not checked off until the parent pushes and re-runs against the new deploy)
- `playwright.config.ts`: `E2E_BASE_URL` sets `baseURL` and disables `webServer`; remote runs use 4 workers so parallel load does not distort timing checks. `npm run test:e2e:remote` -> `scripts/e2e-remote.mjs` (no cross-env; spawns the Playwright CLI with `E2E_BASE_URL`, forwards the exit code, extra args allowed). Google Fonts are only aborted locally (`isRemote` in `e2e/fixtures.ts`).
- `e2e/deployment.spec.ts` (remote only, 9 tests x 3 projects): CSP / X-Frame-Options DENY / nosniff, immutable `/assets/*`, HTML revalidation, deep links + reload (`/gastos`, `/gastos/nuevo`, `/mes-anterior`, `/admin`), no console errors or CSP violations, Nunito and Inter loaded, load < 3 s.
- Remote run against the CURRENT deploy (old code): 87 passed (60 acceptance/layout + 27 deployment), repeated 3 times, all green. First attempt had 9 failures, all test-side or Netlify-side, none in our code: (a) `/` is served with `Cache-Control: public,max-age=0,must-revalidate` (equivalent to no-cache; assertion widened); (b) `document.fonts.check('1em Nunito')` is false because only weights 700/800 are declared (checks now use `800 1em Nunito` / `400 1em Inter`); (c) Netlify injects its own HUD badge (`/.netlify/scripts/hud`) that builds an inline srcdoc iframe which our correct CSP blocks, producing a console error. The console test stubs that Netlify script. This is a Netlify-injected artefact, not a defect in our CSP; it can be removed in the Netlify site settings (snippet injection / badge).
- One acceptance perf failure was seen once under 16 parallel remote workers and did not recur (hence the 4-worker cap).

### T11 (delivery)
- T10/T11 commits ebb0fcd, f4d2ad3, 534e980, 406e51e, 04367a9, 224e3cb reviewed one by one in detached worktrees (user granted all 6): all approved and acknowledged.
- Pushed to origin/main; Netlify served the new bundle (index-DEbjM4qN.js) ~20 s later.
- `npm run test:e2e:remote` against https://clinicaveterinariagastos.netlify.app: 87 passed, 2 consecutive runs (desktop-chromium, mobile-android Pixel 7, mobile-ios iPhone 14 WebKit; acceptance + layout + deployment specs).

### T12 (branch `feat/clinic-info-page`)
- Route: delegated writer (page + route + nav + tests = 2+ non-trivial files).
- RED: `src/app/clinicInfo.integration.test.tsx` (5 tests) failed 5/5 before implementation: no "Clínica" nav link and no `/clinica` route (`Unable to find an accessible element with the role "link"`).
- GREEN: new slice `src/features/clinic-info/{domain/clinicInfo.ts,ui/ClinicInfoPage.tsx}`, lazy route `clinica`, nav item "Clínica" (new `MapPinIcon`) between "Mes anterior" and "Admin". Maps and Facebook links use `target="_blank" rel="noopener noreferrer"`; phone is `tel:+59842231258`; no iframe, CSP unchanged. Opening hours intentionally omitted.
- E2E: `/clinica` added to the no-horizontal-overflow routes (also the 360px test), the fixed-controls-cover test and the 44px tap-target list in `e2e/layout.spec.ts`. README updated (features, project tree, lazy routes).
- Checks: typecheck, lint clean; `npx vitest run` 24 files / 214 tests pass; build OK; `check:bundle` 67.5 KB gzip (ClinicInfoPage chunk 0.8 KB); `npx playwright test` 66 passed, 27 skipped (remote-only deployment spec).
- Review assessment (commit 0c60753, base main, committed-only): risk medium (executable_change e2e/layout.spec.ts), 171 lines, review_due=false (under_budget) — stays pending in slice.
