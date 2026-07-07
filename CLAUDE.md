# CLAUDE.md — Automated Payroll Processing System

This file gives you (Claude Code) permanent context for this project. Read it before doing anything.
The instructions here override casual requests in chat if they conflict. Keep code consistent with what is written below.

## Project Overview

A full-stack web app that automates payroll for a **healthcare & training service provider** with a large
part-time workforce and an incentive-based scheme for full-timers. It replaces a manual process where staff spend
10–20 hours every fortnight copying roster hours into an HRMS and paying staff by hand.

The automated pipeline is strictly sequential:

```
roster (Google Sheets) → timesheet → payroll calc → management approval → payment file + HRMS sync
```

This is a graded polytechnic group project (5 members, one use case each). Build clean, readable,
beginner-maintainable code — not clever code.

## The Five Use Cases

| ID | Name | Actor |
|----|------|-------|
| UC-001 | Import & Sync Roster Working Hours | System (scheduled) / Accounting Staff |
| UC-002 | Validate & Consolidate Timesheets | Accounting Staff |
| UC-003 | Calculate Payroll & Incentives (incl. CPF, SDL) | Accounting Staff |
| UC-004 | Review & Approve Payroll | Managing Director / Manager |
| UC-005 | Generate Payment File (GIRO) & Sync to HRMS | Accounting Staff + System |

**Build ONE use case per session unless I explicitly say otherwise.** Do not scaffold all five at once.

## Tech Stack (do not substitute without asking)

- **Frontend:** React + shadcn/ui, **JavaScript** (not TypeScript)
- **Backend:** Python + FastAPI
- **ORM / migrations:** SQLAlchemy + Alembic
- **Database:** PostgreSQL
- **Integrations:** Google Sheets API (roster in), Infotech HRMS (records out), banking platform (GIRO file out)

## Repository Structure

```
/backend
  /app
    /api          # FastAPI routers, one file per use case (uc001_roster.py, uc004_approval.py, ...)
    /models       # SQLAlchemy models — THE schema lives here
    /schemas      # Pydantic request/response models
    /services     # business logic (payroll calc, CPF/SDL, validation rules)
    /core         # config, db session, settings
    main.py
  /alembic        # migrations (auto-generated from models)
  /tests          # pytest, one test file per use case
  requirements.txt
/frontend
  /src
    /components   # shadcn/ui-based components
    /pages        # one folder per use case screen
    /lib          # api client, helpers
  package.json
```

Put each member's use case in its own router/service/test files. Do not edit another use case's files
unless the task explicitly says so — this keeps the group's git history clean and avoids merge conflicts.

## Database Rules — READ CAREFULLY

**SQLAlchemy models are the single source of truth for the schema.** The workflow is always:

1. Define or change a table by editing a model in `/backend/app/models`.
2. Generate a migration: `alembic revision --autogenerate -m "describe change"`.
3. Review the generated migration file, then apply it: `alembic upgrade head`.

**The database GUI (pgAdmin / DBeaver) is for INSPECTING and VERIFYING data only.**
NEVER create, drop, or alter tables by hand in the GUI. Manual schema changes drift out of sync with the
models and silently break payroll logic. If a table needs to change, change the model and migrate.

Connection string lives in `/backend/app/core/config.py`, read from a `.env` file (never hard-code credentials).

## Payroll Domain Rules (Singapore-specific — get these right)

- Part-timer gross pay = validated hours × hourly rate, applying overtime and public-holiday multipliers.
- Full-timer incentive pay is calculated from **performance inputs** (sessions delivered, enrolments, sales,
  KPI results) — NOT from hours.
- **The system computes CPF and SDL itself.** The HRMS only receives the final figures for record-keeping;
  it does not recompute them. Keep the CPF/SDL calculation isolated in a service function so it can be
  unit-tested and updated when rates change.
- Validated hours are **frozen into a snapshot** at UC-002; payroll is always calculated on the frozen
  snapshot, never on live roster data.
- Payroll status flow: Draft → Validated → Pending Approval → Approved (locked) → Payment Ready.
  Approval (UC-004) records who approved and when, and locks the record. Rejection routes back to UC-003.

## Authentication

Login / role-based access is **deferred for this iteration**. Roles (Accounting Staff, Managing Director)
are just labels on "who does what," not an enforced permission system. Do NOT add auth, JWT, or password
handling unless I explicitly ask — it's out of scope and adding it will fail the graded scope.

## Coding Standards

- Backend: PEP 8, type hints on function signatures, docstrings on service functions.
- Money: never use floats for currency — use `Decimal`. This matters for CPF/SDL rounding.
- Every service function that does a calculation gets pytest unit tests, including edge/error cases
  (missing pay rate, unmatched staff, threshold warnings). Aim for the phase's coverage target.
- Handle the error/alternative flows from the use case, not just the happy path.
- Comment WHY, not WHAT. Assume a teammate who is also a student will read this.

## How I want you to work

- Before writing code for a use case, restate your plan in a few bullets and wait for my "go" if the task is large.
- After you finish a task, run the tests and tell me the result. Don't claim something works without running it.
- If a design doc and my chat request conflict, point it out instead of guessing.
- Keep changes scoped to the task. Don't refactor unrelated files.
