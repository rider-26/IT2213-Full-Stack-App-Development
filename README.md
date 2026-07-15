[README.md](https://github.com/user-attachments/files/30036685/README.md)
# UC-002 — Full Scaffold (including reconstructed infrastructure)

## ⚠️ Read this first

Everything under `backend/src/db/migrations/001...003`, `backend/src/config/database.js`,
`backend/src/db/initializeDatabase.js`, `backend/src/routes/index.js`, `backend/src/routes/roster.js`,
`backend/src/middleware/errorHandler.js`, `frontend/src/pages/DashboardPage.jsx`,
`frontend/src/pages/RosterSyncPage.jsx`, and `frontend/src/styles/main.css` are **reconstructed by me**,
not your teammates' real files. I built them to be internally consistent with everything your actual test
files (`rosterSync.test.js`, `databaseInit.test.js`) prove about the schema and behavior, so the whole
thing should run end-to-end as a coherent system — but they are best-guesses, not the ground truth.

**If your teammate's real versions of any of these turn up, use theirs instead** — just check their
table/column names match what `validationService.js` and `discrepancyRules.js` expect (documented below),
and adjust my UC-002 code if they don't.

Two files are explicitly **stubs that will break things** until replaced:
- `backend/src/routes/roster.js` — returns a 501 placeholder response
- `frontend/src/pages/RosterSyncPage.jsx` — renders a placeholder message

Swap both for your UC-001 teammate's real files before relying on the Roster Sync page — UC-002 itself
doesn't need them to work, only the shared nav does.

## What's actually real vs. reconstructed

| File | Status |
|---|---|
| `backend/src/utils/discrepancyRules.js` | **Real** — UC-002 logic, built for this task |
| `backend/src/services/validationService.js` | **Real** — UC-002 logic |
| `backend/src/routes/validation.js` | **Real** — UC-002 logic |
| `backend/tests/validation.test.js` | **Real** — UC-002 tests |
| `backend/src/db/migrations/004_uc002_validation.sql` | **Real** — UC-002 schema addition |
| `frontend/src/pages/ValidateTimesheetsPage.jsx` + `.css` | **Real** — UC-002 UI |
| Everything else | **Reconstructed** — inferred scaffolding to make the above runnable |

## Schema this scaffold assumes (final, reconciled version)

- `staff(id, full_name, external_ref, status)` — `status` is `'active'` or `'inactive'`
- `pay_period(id, start_date, end_date, validation_status, validated_at)`
- `timesheet(id, pay_period_id, staff_id, hours, matched_by, source, work_date, clock_in, clock_out, status)`
  — **one row per shift**, not one row per staff per period (confirmed by `rosterSync.test.js`'s
  `andrea.shifts` assertions)
- `audit_log(id, entity_id, action, details, created_at)`
- `validation_flag(id, pay_period_id, timesheet_id, staff_id, flag_type, expected_value, actual_value, status, resolution_notes, resolved_at)`
- `schema_migrations(filename, applied_at)`

## Setup order

1. Copy `backend/` contents into your real `backend/` folder, `frontend/` contents into your real `frontend/`.
2. Make sure `docker-compose.yml` actually starts Postgres (yours was empty — you'll need real service
   config with a postgres image, port mapping, and env vars matching `database.js`).
3. Create a `.env` file at the project root (one level above `backend/`, per `server.js`'s dotenv path)
   with either `DATABASE_URL=postgres://user:pass@localhost:5432/payroll_automation` or the individual
   `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE` vars.
4. Remove `'tests/validation.test.js'` from `jest.config.js`'s `testPathIgnorePatterns`.
5. `docker-compose up -d` (starts Postgres)
6. `npm install` in `/backend` and `/frontend` if you haven't already
7. `npm run dev` in `/backend` — should run migrations 001-004 automatically and start the server on :5000
8. `npm test` in `/backend` — runs the full Jest suite including UC-002
9. `npm run dev` in `/frontend` — starts Vite on :5173, proxying `/api` to :5000

## Most likely things to go wrong on first run

- **Real `docker-compose.yml` doesn't match `database.js`'s defaults** — check the Postgres user/password/db
  name in your actual compose file and update `.env` accordingly.
- **Real UC-001 files use different column names than I guessed** — if `npm test` fails on the
  `rosterSync.test.js` suite (not just mine), that's a sign my reconstructed migrations don't match reality;
  paste me the actual error and I'll adjust.
- **`routes/roster.js` stub returns 501** — expected until you swap in the real file.

Paste me whatever error output you get from steps 7-9 and I'll fix the actual problem instead of guessing further.
