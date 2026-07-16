# Project Knowledge Base

## Build & Run
- **Backend:** `go build -o hrhub.exe ./cmd/server` then `.\hrhub.exe` on port :3000
- **Frontend:** `npm run dev` in `web/` on port :5173
- **Swagger:** run `swag init -g cmd/server/main.go -o docs` after handler changes, view at http://localhost:3000/swagger/index.html
- **Regen swagger:** `& "C:\Users\SHAKIL\go\bin\swag.exe" init -g cmd/server/main.go -o docs`

## Database
- PostgreSQL: `host=localhost user=shakil password=123456 dbname=hrhub`
- AutoMigrate models: User, AuthSession, Company, Employee, Shift, Attendance, DataLog, LeaveType, LeaveAllocation, Leave (plus 18 more)
- Employee uses `employee_code` field for ZKTeco badge number mapping

## Seeds
- **Geo data (divisions/districts/upazilas/unions):** `go run cmd/seed/main.go` (fetches from remote JSON, idempotent)
- **Superadmin user:** `go run cmd/superadmin/main.go` — creates superadmin role + all permissions + user. Config via `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME` env vars. Defaults: `superadmin@hrhub.com` / `superadmin1234`
- **Organization:** `go run cmd/seed/organization/main.go` — seeds company (HRHub Technologies Ltd.), 4 branches, 12 departments, 20 sections, 27 designations, production lines, groups A-D, floors 1-10, 5 shifts
- **Leave Types:** `go run cmd/seed/leave/main.go` — seeds 8 default leave types (AL, SL, CL, ML, PL, EL, STL, HL) under the active company

## Architecture (backend)
- `internal/handlers/` – Gin handlers (auth, company, employee, shift, attendance, data_log)
- `internal/models/` – GORM models
- `internal/repository/` – Data access layer
- `internal/service/` – Business logic (auth, mdb_reader)
- `internal/routes/routes.go` – All route registration
- `internal/middleware/` – Auth JWT, CORS, Logger
- `internal/server/` – Wires everything together

## Routes (API v1)
- Auth: register, login, refresh, logout, logout-all, change-password, me, sessions
- Companies: CRUD
- Employees: list
- Shifts: CRUD
- Attendance: CRUD + clock-in, clock-out
- Data Logs: import (from ZKTeco MDB), list, process (→ attendance), stats
- **Leave Types:** CRUD
- **Leaves:** list, apply, update, cancel, approve, reject
- **Leave Balance:** list by employee/year
- **Leave Reports:** monthly (by department)

## ZKTeco MDB Data Flow
1. `POST /api/v1/data-logs/import` – reads MDB file via PowerShell ADODB/ACE.OLEDB.12.0, optionally filtered by `start_date`/`end_date` (YYYY-MM-DD). Stores raw punch records as DataLog entries (processed=false).
2. `POST /api/v1/data-logs/process` – takes `date` and `company_id`. Finds unprocessed logs, groups by ZK user, matches `badge_number` → `employee_code` in employees table. Creates Attendance records (check-in from first 'I' punch, check-out from last 'O' punch). Only marks logs as processed on success.
3. `GET /api/v1/data-logs` – list by date range
4. `GET /api/v1/data-logs/stats` – total/today counts

## Important
- SutonnyMJ (ANSI) font for Bengali fields – Bijoy Classic ANSI mode CANNOT work in web browsers
- Employee `employee_code` must match ZKTeco `Badgenumber` for process to create attendance
- DataLog import resets processed flag; re-importing is safe
