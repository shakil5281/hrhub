# HRHub — Project Knowledge Base (Single Source of Truth)

> **Purpose:** This document is the complete reference for the HRHub application. Any agent or developer should be able to understand the entire system — architecture, APIs, database, frontend, data flows, and business rules — from this file alone.

---

## 1. Project Overview

**HRHub** is an enterprise Human Resource Management & Payroll System targeting Bangladeshi garment/factory industries. It manages the full employee lifecycle, integrates biometric attendance (ZKTeco), tracks leave balances, and automates monthly payroll processing.

**Deployment:** Monolithic. Docker Compose (PostgreSQL + Go backend + Next.js frontend).

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Language** | Go | 1.26.2 | Backend API |
| **Web Framework** | Gin | 1.12.0 | HTTP router/middleware |
| **ORM** | GORM | 1.31.2 | With PostgreSQL driver |
| **Database** | PostgreSQL | 16 | Primary data store |
| **Authentication** | JWT (golang-jwt/v5) | 5.3.1 | Access + Refresh tokens |
| **Password Hash** | bcrypt (golang.org/x/crypto) | — | Standard |
| **API Docs** | Swaggo | 1.16.6 | Swagger/OpenAPI 2.0 |
| **Frontend** | Next.js (App Router) | 16.2.10 | React 19.2.4 |
| **Styling** | Tailwind CSS | v4 | Utility-first |
| **UI Components** | shadcn/ui + Radix | — | Accessible primitives |
| **Tables** | TanStack Table | v8 | Frontend data grids |
| **Charts** | Recharts | 3.8.0 | Dashboard charts |
| **HTTP Client** | Axios | 1.18.1 | With interceptors |
| **Biometric** | ZKTeco ADODB/ACE.OLEDB.12.0 | — | **Windows-only** |
| **Container** | Docker & Docker Compose | — | 3 services |

---

## 3. Directory Structure

```
hrhub/
├── .env                     # Environment variables (DB, JWT, ports)
├── .env.example             # Template for env vars
├── docker-compose.yml       # 3-service orchestration
├── Dockerfile               # Backend image
├── go.mod / go.sum          # Go dependencies
├── cmd/
│   ├── server/main.go       # API entry point (Swagger annotations here)
│   ├── seed/main.go         # Geo data seeder (divisions/districts/upazilas/unions)
│   ├── seed/organization/main.go  # Company/org hierarchy seeder
│   ├── seed/leave/main.go   # Default leave types seeder
│   ├── seed/employee/main.go      # Employee seeder
│   └── superadmin/main.go   # Creates superadmin role + user
├── internal/
│   ├── auth/
│   │   ├── jwt.go           # JWT generation & validation
│   │   └── password.go      # bcrypt hashing
│   ├── config/
│   │   └── config.go        # Env-based config loader (port 5000 default)
│   ├── database/
│   │   └── postgres.go      # GORM connection + AutoMigrate + ALTER fixes
│   ├── handlers/            # ~25 handler files (HTTP layer)
│   │   ├── auth.go, auth_register.go
│   │   ├── attendance.go
│   │   ├── company.go
│   │   ├── dashboard.go
│   │   ├── data_log.go
│   │   ├── employee.go, employee_export.go, employee_import.go
│   │   ├── floor.go, group.go
│   │   ├── health.go
│   │   ├── id_card.go
│   │   ├── leave.go
│   │   ├── organization.go, organization_import.go
│   │   ├── requirement.go
│   │   ├── salary.go
│   │   ├── separation.go
│   │   ├── shift.go
│   │   ├── temporary_shift.go
│   │   └── upload.go
│   ├── middleware/
│   │   ├── auth.go          # JWT Bearer validation
│   │   ├── audit.go         # Audit log middleware (POST/PUT/PATCH/DELETE)
│   │   ├── cors.go          # CORS headers
│   │   ├── logger.go        # Request logging
│   │   └── permission.go    # RBAC permission & role checks
│   ├── utils/
│   │   └── pagination.go    # Pagination DTOs and helpers
│   ├── models/              # 35 GORM model files
│   ├── repository/          # ~20 repository files (data access)
│   ├── routes/
│   │   └── routes.go        # ALL route registrations (single file)
│   ├── server/
│   │   └── server.go        # Dependency injection wiring
│   └── service/
│       ├── auth.go          # Auth business logic (login, register, refresh)
│       └── mdb_reader.go    # ZKTeco MDB PowerShell reader
├── docs/                    # Swagger generated files
├── backups/                 # PostgreSQL dump files (.sql)
├── uploads/                 # Static file uploads
└── web/                     # Next.js frontend
    ├── app/                 # App Router pages
    │   ├── (auth)/          # Login, Register (no layout sidebar)
    │   └── (root)/          # All authenticated pages
    │       ├── dashboard/
    │       ├── attendance/     # daily, monthly, summary, job-card, missing, absent, OT
    │       ├── collect-data/   # log-collect, daily-process, monthly-process
    │       ├── hr/             # employees, id-card, requirements, seperation
    │       ├── information/    # company, organization, floor, group, shift, temp-shift, address
    │       ├── leave/          # leave-types, leave-entry, leave-details, monthly-report
    │       ├── payroll/        # salary-sheet, daily-salary, payslip, increment, process, summary
    │       ├── analytics/
    │       ├── lifecycle/
    │       ├── notifications/
    │       ├── profile/
    │       └── settings/
    ├── components/
    │   ├── ui/                # shadcn/ui components
    │   ├── table/             # DataTable wrapper
    │   ├── form/              # Form abstractions
    │   ├── layout/            # Sidebar, Navbar, AppShell
    │   └── ...
    ├── lib/
    │   ├── api.ts             # Centralized API client functions
    │   ├── axios-instance.ts  # Axios config + token refresh interceptor
    │   ├── crud-factory.ts    # CRUD abstraction
    │   └── utils.ts           # cn() and helpers
    └── package.json
```

---

## 4. Backend Architecture

### 4.1 Layered Architecture (Clean Architecture-ish)

```
HTTP (Gin Router)
    ↓
Handlers (Request/Response DTOs, binding, status codes)
    ↓
Services (Business logic, auth flow, external readers)
    ↓
Repositories (GORM queries, raw SQL for aggregations)
    ↓
Models (GORM structs, JSON tags, DB tags)
    ↓
PostgreSQL
```

**Note:** There is no strict "Use Case" or "Domain" layer. Business logic lives in both `service/` and `handlers/` (e.g., salary calculation is inside `salary.go` handler). This is acceptable for current scale but should be refactored if complexity grows.

### 4.2 Dependency Injection

All dependencies are manually wired in `internal/server/server.go`:

1. Database connection (`database.Connect(cfg)`)
2. JWT config (`auth.JWTConfig`)
3. Repositories (one per aggregate root)
4. Services (auth service receives user + auth repos)
5. Handlers (each receives its required repositories/services)
6. Routes (`routes.Setup(...)` receives all handlers)

There is no DI framework (Wire/Dig). At current scale (~25 handlers) manual wiring is manageable.

### 4.3 Middleware Pipeline (per request)

```
CORS Middleware
    ↓
Logger Middleware
    ↓
Audit Middleware (captures POST/PUT/PATCH/DELETE to audit_logs table)
    ↓
Auth Middleware (Bearer JWT validation, sets user_id/email/roles/permissions)
    ↓
Permission/Role Middleware (optional, on specific routes — e.g., super_admin for destructive ops)
    ↓
Handler
```

---

## 5. Frontend Architecture

- **Framework:** Next.js 16 App Router (`app/` directory)
- **Rendering:** Almost entirely Client-Side Rendering (`"use client"`) with React hooks
- **State:** Local React state (no global state manager like Zustand/Redux)
- **Data Fetching:** Axios via `lib/api.ts` on component mount / user interaction
- **Token Refresh:** Automatic 401 interceptor refreshes access token using refresh token, updates localStorage + cookie, retries request
- **Auth Persistence:** `localStorage` (access_token, refresh_token) + cookie (auth_token)
- **Navigation:** `next/navigation` `useRouter()`
- **UI System:** Tailwind + shadcn/ui (Button, Card, Badge, Input, Select, Dialog, Toast/Sonner, Tooltip, DataTable)
- **Forms:** React Hook Form + Zod resolvers
- **Tables:** TanStack React Table v8 with server-side data
- **Charts:** Recharts (used on dashboard and analytics)

---

## 6. Database Schema (RDBMS)

### 6.1 Summary

**Total Tables:** 35  
**Primary Key Type:** `uuid` (gen_random_uuid()) on all tables  
**Soft Deletes:** `deleted_at` (GORM `gorm.DeletedAt`) on nearly all tables  
**Audit Columns:** `created_by`, `updated_by`, `deleted_by` (UUID, nullable) on most tables  
**Foreign Key Constraints:** **NONE** — `DisableForeignKeyConstraintWhenMigrating: true` is set. Referential integrity is application-level only.

### 6.2 Auth & Identity (12 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | System users | `id` UUID PK, `email` unique, `password_hash`, `status`, `mfa_enabled`, `failed_attempts`, `locked_at`, `force_password_change`, `email_verified_at` |
| `roles` | Role definitions | `id` UUID PK, `company_id` UUID, `name`, `is_system` |
| `permissions` | Permission definitions | `id` UUID PK, `resource`, `action`, `description` |
| `user_roles` | User-Role junction | `id` UUID PK, `user_id`, `role_id` |
| `role_permissions` | Role-Permission junction | `id` UUID PK, `role_id`, `permission_id` |
| `sessions` | Active sessions | `id` UUID PK, `user_id`, `ip_address` (inet), `user_agent`, `browser`, `os`, `last_active`, `expires_at` |
| `refresh_tokens` | Refresh token storage | `id` UUID PK, `user_id`, `token_hash` unique, `device_info`, `ip_address`, `expires_at`, `revoked_at` |
| `login_histories` | Login audit | `id` UUID PK, `user_id`, `email`, `status`, `ip_address`, `browser`, `os` |
| `password_histories` | Previous passwords | `id` UUID PK, `user_id`, `password_hash` |
| `password_resets` | Reset tokens | `id` UUID PK, `user_id`, `token_hash` unique, `expires_at`, `used_at` |
| `email_verifications` | Email verification tokens | `id` UUID PK, `user_id`, `email`, `token_hash`, `purpose`, `expires_at`, `used_at` |
| `audit_logs` | Change audit | `id` UUID PK, `user_id`, `company_id`, `action`, `resource`, `resource_id`, `old_value` (jsonb), `new_value` (jsonb) |

**Relationships:**
- `users` ↔ `roles` (many-to-many via `user_roles`)
- `roles` ↔ `permissions` (many-to-many via `role_permissions`)

### 6.3 Organization & Geo (11 tables)

| Table | Purpose | Parent | Key Fields |
|-------|---------|--------|------------|
| `companies` | Tenant/company | — | `id` UUID PK, `company_name_bn`, `company_name_en`, `slug` unique, `address_bn`, `address_en`, `phone`, `email`, `signature`, `owner_id`, `status`, `settings` (jsonb) |
| `departments` | Departments | `companies` | `id` UUID PK, `company_id`, `name`, `name_bn`, `head_id`, `status` |
| `sections` | Sections | `departments` | `id` UUID PK, `department_id`, `name`, `name_bn` |
| `designations` | Job designations | `sections` | `id` UUID PK, `section_id`, `name`, `name_bn` |
| `lines` | Production lines | `sections` | `id` UUID PK, `section_id`, `name`, `name_bn` |
| `groups` | Employee groups | — | `id` UUID PK, `name` |
| `floors` | Building floors | — | `id` UUID PK, `name` |
| `divisions` | BD admin divisions | — | `id` UUID PK, `name`, `name_bn` |
| `districts` | BD districts | `divisions` | `id` UUID PK, `division_id`, `name`, `name_bn` |
| `upazilas` | BD upazilas | `districts` | `id` UUID PK, `district_id`, `name`, `name_bn` |
| `unions` | BD unions | `upazilas` | `id` UUID PK, `upazila_id`, `name`, `name_bn` |

### 6.4 HR Core (4 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `employees` | Employee master | `id` UUID PK, `user_id` UUID, `company_id` UUID, `employee_id` **varchar(50)** unique (business key), `punch_number` varchar(50) unique, `name_en`, `name_bn`, `father_name`, `mother_name`, `date_of_birth`, `gender`, `blood_group`, `marital_status`, `religion`, `nationality`, `nid`, `phone`, `email`, `present_address`, `permanent_address`, `spouse_name`, `emergency_contact`, `emergency_phone`, `number_of_dependents`, `department_id`, `section_id`, `designation_id`, `line_id`, `group_id`, `floor_id`, `employee_type`, `grade`, `joining_date`, `shift_id`, `reports_to`, `present_division_id`, `present_district_id`, `present_upazila_id`, `present_union_id`, `permanent_division_id`, `permanent_district_id`, `permanent_upazila_id`, `permanent_union_id`, `gross_salary`, `basic_salary`, `house_rent`, `transport_allowance` (default 450), `food_allowance` (default 1250), `medical_allowance` (default 750), `other_allowance`, `account_type`, `account_number`, `status` (default active), `over_time_status` (default false), `signature_url`, `image_url` |
| `shifts` | Work shifts | `id` UUID PK, `company_id`, `name`, `shift_type` (default day), `start_time` (HH:MM), `end_time` (HH:MM), `late_grace_minutes`, `weekend_days` (comma-separated, e.g., "Fri,Sat"), `status` |
| `temporary_shifts` | Per-employee shift override | `id` UUID PK, `employee_id`, `shift_id`, `company_id`, `date`, `reason`, `status` |
| `requirements` | Job vacancies | `id` UUID PK, `position`, `department_id`, `vacancies`, `applicants`, `status` (default Open), `priority` (default Medium) |

**Employee Address Relations:**
- Present: `present_division_id` → `divisions`, `present_district_id` → `districts`, `present_upazila_id` → `upazilas`, `present_union_id` → `unions`
- Permanent: same pattern with `permanent_*` fields

**Employee Organizational Relations:**
- `department_id` → `departments`
- `section_id` → `sections`
- `designation_id` → `designations`
- `line_id` → `lines`
- `group_id` → `groups`
- `floor_id` → `floors`
- `shift_id` → `shifts`
- `reports_to` → `employees` (self-referencing manager)

### 6.5 Attendance & Biometric (2 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `data_logs` | Raw ZKTeco punches | `id` UUID PK, `user_id` int (ZK internal), `badge_number` varchar(50), `employee_name`, `punch_time` timestamp, `punch_type` varchar(1) ('I'/'O'), `device_id`, `device_sn`, `date` date, `processed` boolean (default false) |
| `attendances` | Processed attendance | `id` UUID PK, `employee_id` **varchar(50)**, `company_id` UUID, `shift_id` UUID, `date` date, `check_in` varchar(5) (HH:MM), `check_out` varchar(5), `total_hours` varchar(5), `over_time` varchar(5), `status` varchar(20) (present/absent/late/on_leave/weekend/half_day), `late_minutes` int, `punch_number` varchar(50) |

**Indexes:**
- `data_logs`: `date` + `processed`, `user_id`, `punch_time`, `badge_number`
- `attendances`: `idx_attendance_employee_date` on (`employee_id`, `date`)

### 6.6 Leave Management (3 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `leave_types` | Leave definitions | `id` UUID PK, `company_id`, `name`, `code`, `total_days`, `carry_forward_days`, `applicable_gender` (default All), `status` |
| `leave_allocations` | Per-employee balance | `id` UUID PK, `employee_id` **varchar(50)**, `leave_type_id` UUID, `year` int, `total_days`, `used_days` (default 0), `pending_days` (default 0). **Unique:** (`employee_id`, `leave_type_id`, `year`) |
| `leaves` | Leave applications | `id` UUID PK, `company_id`, `employee_id` **varchar(50)**, `leave_type_id` UUID, `from_date` date, `to_date` date, `total_days` int, `reason` text, `status` (pending/approved/rejected/cancelled), `approved_by`, `approved_at`, `rejection_reason` |

### 6.7 Payroll (1 table)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `salaries` | Monthly payroll | `id` UUID PK, `company_id` UUID, `employee_id` **varchar(50)**, `month` int, `year` int, `basic_salary`, `house_rent`, `medical_allowance`, `transport_allowance`, `food_allowance`, `other_allowance`, `gross_salary`, `provident_fund`, `tax`, `absent_deduction`, `other_deduction`, `total_deductions`, `overtime_hours`, `overtime_rate`, `overtime_amount`, `attendance_bonus`, `net_salary`, `present_days`, `absent_days`, `late_days`, `leave_days`, `weekend_days`, `total_days`, `status` (default processed). **Unique:** (`company_id`, `employee_id`, `month`, `year`) |

### 6.8 Support (2 tables)

| Table | Purpose |
|-------|---------|
| `separations` | Employee separation records |
| `id_cards` | Employee ID card issuance records |

### 6.9 Critical Schema Notes

1. **Dual Employee Key System:** `employees.id` is UUID (PK). `employees.employee_id` is VARCHAR(50) (business key). `attendances`, `leaves`, `leave_allocations`, and `salaries` all reference the VARCHAR business key (`employee_id`), NOT the UUID `id`. This means **no true foreign key constraints** can exist on these relationships. Data integrity is application-level only.
2. **GORM VARCHAR Override:** GORM 1.31.2 forces UUID type on `*_id` columns. `postgres.go` runs `ALTER TABLE ... TYPE varchar(50)` after AutoMigrate to fix `employee_id` columns in `employees`, `attendances`, `leaves`, `leave_allocations`, `salaries`, `temporary_shifts`.
3. **No FK Constraints in DB:** `DisableForeignKeyConstraintWhenMigrating: true` means zero database-level foreign keys. All relationships are managed by GORM associations only.
4. ~~**AuditLog Table Unused:**~~ ✅ **FIXED** — `middleware/audit.go` now captures all POST/PUT/PATCH/DELETE operations and writes to `audit_logs` asynchronously.
5. **Auto-Created Performance Indexes:** `postgres.go` creates `IF NOT EXISTS` indexes on startup for high-frequency query patterns (salaries, employees, leave_allocations, temporary_shifts, data_logs, attendances, leaves, sessions).

---

## 7. Complete API Inventory

All routes are prefixed with `/api/v1` unless noted. Authentication: Bearer JWT required on all routes except marked **Public**.

### 7.1 Public Routes

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/health` | `HealthCheck` | Health probe |
| POST | `/auth/register` | `authHandler.Register` | User registration |
| POST | `/auth/login` | `authHandler.Login` | Login (returns access + refresh tokens) |
| POST | `/auth/refresh` | `authHandler.RefreshToken` | Exchange refresh for new access token |
| POST | `/auth/logout` | `authHandler.Logout` | Revoke single refresh token |

### 7.2 Auth (Protected)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/logout-all` | Revoke all user refresh tokens |
| PUT | `/auth/change-password` | Change password (min 12 chars) |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/profile` | Update current user profile (name) |
| GET | `/auth/sessions` | List active sessions |

### 7.3 Company Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/companies` | List all companies |
| GET | `/companies/:id` | Get company by ID |
| POST | `/companies` | Create company |
| PUT | `/companies/:id` | Update company |
| DELETE | `/companies/:id` | Delete company |

### 7.4 Organization Hierarchy

| Entity | GET List | GET One | POST | PUT | DELETE |
|--------|----------|---------|------|-----|--------|
| **Departments** | `/departments` | `/departments/:id` | `/departments` | `/departments/:id` | `/departments/:id` |
| **Sections** | `/sections` | `/sections/:id` | `/sections` | `/sections/:id` | `/sections/:id` |
| **Designations** | `/designations` | `/designations/:id` | `/designations` | `/designations/:id` | `/designations/:id` |
| **Lines** | `/lines` | `/lines/:id` | `/lines` | `/lines/:id` | `/lines/:id` |
| **Groups** | `/groups` | `/groups/:id` | `/groups` | `/groups/:id` | `/groups/:id` |
| **Floors** | `/floors` | `/floors/:id` | `/floors` | `/floors/:id` | `/floors/:id` |

### 7.5 Geo/Address (Bangladesh Administrative)

| Entity | GET List | GET One | POST | PUT | DELETE |
|--------|----------|---------|------|-----|--------|
| **Divisions** | `/divisions` | `/divisions/:id` | `/divisions` | `/divisions/:id` | `/divisions/:id` |
| **Districts** | `/districts` | `/districts/:id` | `/districts` | `/districts/:id` | `/districts/:id` |
| **Upazilas** | `/upazilas` | `/upazilas/:id` | `/upazilas` | `/upazilas/:id` | `/upazilas/:id` |
| **Unions** | `/unions` | `/unions/:id` | `/unions` | `/unions/:id` | `/unions/:id` |

**Note:** Districts accept `?division_id=`, Upazilas accept `?district_id=`, Unions accept `?upazila_id=` for filtering.

### 7.6 Employees

| Method | Path | Description |
|--------|------|-------------|
| GET | `/employees` | List employees (filters: company_id, department_id, section_id, designation_id, line_id, group_id, employee_id, status, gender, blood_group, min_salary, max_salary) |
| GET | `/employees/:id` | Get employee by ID |
| POST | `/employees` | Create employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |
| GET | `/employees/import/template` | Download Excel import template |
| POST | `/employees/import` | Bulk import from Excel |
| GET | `/employees/export/excel` | Export filtered employees to Excel |
| GET | `/employees/export/pdf` | Export filtered employees to PDF |

### 7.7 Shifts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/shifts` | List shifts |
| GET | `/shifts/:id` | Get shift |
| POST | `/shifts` | Create shift |
| PUT | `/shifts/:id` | Update shift |
| DELETE | `/shifts/:id` | Delete shift |

### 7.8 Temporary Shifts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/temporary-shifts` | List temporary shifts |
| GET | `/temporary-shifts/:id` | Get temporary shift |
| POST | `/temporary-shifts` | Assign temporary shift to employee for a date |
| PUT | `/temporary-shifts/:id` | Update |
| DELETE | `/temporary-shifts/:id` | Delete |

### 7.9 Attendance (14 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/attendance` | List by date (default today) + all org filters |
| GET | `/attendance/:id` | Get attendance record |
| POST | `/attendance` | Create manual attendance (upserts if same employee+date exists) |
| PUT | `/attendance/:id` | Update attendance |
| DELETE | `/attendance/:id` | Delete attendance |
| DELETE | `/attendance/delete-all` | **Permanently** delete all attendance |
| POST | `/attendance/clock-in` | Mark clock-in for today |
| POST | `/attendance/clock-out` | Mark clock-out for today (calculates total_hours) |
| GET | `/attendance/summary` | Aggregated summary by date range |
| GET | `/attendance/overtime` | Overtime sheet (detailed records) |
| GET | `/attendance/overtime-summary` | Overtime aggregated by department |
| GET | `/attendance/job-card` | Job card view (date range + employee) |
| GET | `/attendance/stats` | Today's attendance count |
| GET | `/attendance/missing` | Employees with data_logs but no attendance for date |
| GET | `/attendance/absent` | Employees marked absent for date range |
| GET | `/attendance/monthly-report` | Per-employee monthly summary (present/absent/late/leave/weekend/half_day counts) |

**Query params for attendance list:** `date`, `company_id`, `department_id`, `section_id`, `designation_id`, `line_id`, `group_id`, `shift_id`, `status`, `employee_id`

### 7.10 Data Logs (ZKTeco Integration)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/data-logs` | List raw punch logs by date range |
| GET | `/data-logs/stats` | Total and today log counts |
| POST | `/data-logs/import` | Read MDB file via PowerShell, insert new punches |
| POST | `/data-logs/process` | Convert unprocessed logs → attendance records |
| DELETE | `/data-logs/delete-all` | **Permanently** delete all data logs |

**Import body:** `{ "file_path": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`  
**Process body:** `{ "date": "YYYY-MM-DD", "start_date": "...", "end_date": "...", "company_id": "..." }`

### 7.11 Leave Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/leave-types` | List leave types (filter: `?company_id=`) |
| GET | `/leave-types/:id` | Get leave type |
| POST | `/leave-types` | Create leave type |
| PUT | `/leave-types/:id` | Update leave type |
| DELETE | `/leave-types/:id` | Delete leave type |
| GET | `/leaves` | List leave applications (filters: company_id, department_id, employee_id, status, from_date, to_date) |
| GET | `/leaves/:id` | Get leave application |
| POST | `/leaves` | Apply for leave (validates allocation balance, increments pending_days) |
| PUT | `/leaves/:id` | Update pending leave |
| DELETE | `/leaves/:id` | Cancel pending leave |
| PUT | `/leaves/:id/approve` | Approve leave (moves pending→used, marks attendance as on_leave) |
| PUT | `/leaves/:id/reject` | Reject leave (decrements pending_days) |
| GET | `/leave-balance` | Get leave balance (filters: employee_id, year) |
| GET | `/leave-reports/monthly` | Monthly leave report grouped by department |

### 7.12 Payroll / Salary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/salary/process` | Process monthly salary for all active employees (calculates absent deduction, OT, attendance bonus) |
| GET | `/salary/sheet` | Full salary sheet for month/year (with grand totals) |
| GET | `/salary/payslip` | Single employee payslip (employee_id + month + year) |
| GET | `/salary/list` | Salary list grouped by department summary |
| GET | `/salary/summary` | Salary summary with grand totals by department |

**Salary process body:** `{ "company_id": "...", "month": 1-12, "year": YYYY }`

### 7.13 HR Operations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/requirements` | List job requirements |
| GET | `/requirements/:id` | Get requirement |
| POST | `/requirements` | Create requirement |
| PUT | `/requirements/:id` | Update |
| DELETE | `/requirements/:id` | Delete |
| GET | `/separations` | List separations |
| GET | `/separations/:id` | Get separation |
| POST | `/separations` | Create separation |
| PUT | `/separations/:id` | Update |
| DELETE | `/separations/:id` | Delete |
| GET | `/id-cards` | List ID cards |
| GET | `/id-cards/:id` | Get ID card |
| POST | `/id-cards` | Create ID card |
| PUT | `/id-cards/:id` | Update |
| DELETE | `/id-cards/:id` | Delete |

### 7.14 Dashboard & Database Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Aggregated dashboard statistics |
| POST | `/database/backup` | Create pg_dump backup |
| GET | `/database/backups` | List backup files |
| GET | `/database/export?filename=...` | Download backup SQL |
| POST | `/database/import` | Restore from uploaded SQL |
| POST | `/database/reset` | **DROP all tables + remigrate** |

### 7.15 Organization Import & Upload

| Method | Path | Description |
|--------|------|-------------|
| GET | `/organization/template` | Download org import Excel template |
| POST | `/organization/import` | Bulk import departments/sections/designations/lines/groups/floors |
| POST | `/upload` | Generic file upload → `/uploads/` |

**Pagination:** All `GET` list endpoints support `?page=` (default 1) and `?limit=` (default 20, max 100) query parameters. Responses are wrapped in `PaginatedResponse` with `data`, `total`, `page`, `limit`, `total_pages`.

**Total API Endpoints:** ~100+ (Public: 5, Protected: ~95)

---

## 8. Authentication & Authorization

### 8.1 Token Model
- **Access Token:** JWT (HS256), 15-minute TTL. Contains `sub` (user_id), `email`, `company_id`, `roles[]`, `permissions[]`.
- **Refresh Token:** 64-byte random hex, 7-day TTL. SHA256 hash stored in `refresh_tokens` table. Raw token returned to client.
- **Storage:** Client stores in `localStorage` + cookie (`auth_token`).

### 8.2 RBAC Structure
```
User ──┬──► Role ──┬──► Permission (resource + action)
       │           │
       └──► Direct Permission (not implemented in current code)
```

**Middleware:**
- `AuthMiddleware` — validates Bearer JWT, extracts claims into Gin context (`user_id`, `email`, `roles`, `permissions`).
- `RequirePermission(permission)` — checks if `permissions` context slice contains the required string or `"*"`.
- `RequireRole(role)` — checks if `roles` context slice contains the required role or `"super_admin"`.

**Note:** Most routes use `AuthMiddleware` only. `RequirePermission` and `RequireRole` middleware are applied to **destructive admin endpoints** (`/database/*`, `/attendance/delete-all`, `/data-logs/delete-all`) via `RequireRole("super_admin")`. All other business routes rely on authentication only.

### 8.3 Password Policy
- Minimum 12 characters on password change
- Password history prevents reuse of last N passwords
- Account lockout after failed attempts (schema supports `failed_attempts`, `locked_at`)
- Force password change flag (`force_password_change`)

---

## 9. Core Data Flows

### 9.1 ZKTeco → Attendance (The Biometric Pipeline)

```
ZKTeco Device
    └──► CHECKINOUT table in C:\Program Files (x86)\ZKTeco\att2000.mdb
              │
              ▼
    POST /api/v1/data-logs/import
    PowerShell ADODB script reads USERINFO + CHECKINOUT
    Filters by optional start_date / end_date
              │
              ▼
    data_logs table (raw punches, processed = false)
              │
              ▼
    POST /api/v1/data-logs/process
    For each date in range:
      1. Load unprocessed logs for the date
      2. Build badge_number → employee mapping
         - Primary match: punch_number (ZK BadgeNumber)
         - Fallback match: employee_id (ZK BadgeNumber fallback)
      3. Group punches by ZK user_id
         - First 'I' punch = check_in
         - Last 'O' punch = check_out
      4. Determine shift:
         - Temporary shift lookup (employee_id + date) overrides regular shift
         - Fallback to employee.shift_id
      5. Check approved leaves → status = "on_leave"
      6. Check weekend (shift.weekend_days) → status = "weekend"
      7. Calculate late minutes (check_in vs shift.start_time + grace)
      8. Upsert attendance record
      9. Mark data_logs as processed = true
      10. For ALL active employees with NO attendance record:
          - Create "absent" record (or "weekend"/"on_leave" if applicable)
```

**Key Business Rules:**
- If no punches at all → `status = "absent"`
- If check_in missing but check_out exists → `status = "late"` (present but late arrival treated as incomplete)
- If employee has approved leave covering the date → `status = "on_leave"` regardless of punches
- Weekend days are configured per shift via comma-separated abbreviations ("Fri,Sat")
- Only marks logs processed if attendance creation succeeds (transaction-like behavior via separate updates)

### 9.2 Attendance → Payroll (The Salary Pipeline)

```
POST /api/v1/salary/process
Body: { company_id, month, year }
    │
    ├──► Load all active employees for company
    ├──► Load monthly attendance report (aggregated present/absent/late/leave/weekend/half_day counts per employee)
    ├──► Load monthly overtime hours per employee (SQL calculation: check_out time - shift.end_time)
    │
    └──► For each employee:
         1. gross = employee.gross_salary
         2. basic = gross * 0.5
         3. house_rent = gross * 0.25
         4. medical = gross * 0.1
         5. transport = employee.transport_allowance (default 450)
         6. food = employee.food_allowance (default 1250)
         7. other = employee.other_allowance
         8. per_day_salary = gross / total_days_in_month
         9. absent_deduction = per_day_salary * absent_days
         10. ot_rate = basic / total_days / 8
         11. ot_amount = ot_hours * ot_rate
         12. attendance_bonus = 500 if absent_days == 0 AND present_days > 0
         13. net_salary = gross - absent_deduction + ot_amount + attendance_bonus
         14. Upsert salaries table (company_id + employee_id + month + year)
```

**Key Business Rules:**
- Salary is always calculated from `gross_salary` field on employee record
- Basic is **exactly** 50% of gross
- House rent is **exactly** 25% of gross
- Medical is **exactly** 10% of gross
- Transport and food use employee-level overrides (defaults: 450 and 1250)
- OT rate is based on basic salary divided by days in month divided by 8 hours
- Attendance bonus is a flat 500 BDT for perfect attendance
- PF and Tax are calculated as 0 in current implementation (placeholders)
- Negative net salary is clamped to 0

### 9.3 Leave Application Flow

```
POST /leaves (Apply)
    ├──► Validate from_date <= to_date
    ├──► Calculate total_days = days between inclusive
    ├──► Find LeaveAllocation (employee_id + leave_type_id + year)
    ├──► Check remaining = total_days - used_days - pending_days
    ├──► If remaining < requested → reject (409 Conflict)
    ├──► Create leave record (status = pending)
    └──► Increment allocation.pending_days

PUT /leaves/:id/approve
    ├──► Verify status == pending
    ├──► Set status = approved, approved_by = current_user, approved_at = now
    ├──► Decrement allocation.pending_days, increment allocation.used_days
    └──► Mark attendance as "on_leave" for from_date → to_date range

PUT /leaves/:id/reject
    ├──► Verify status == pending
    ├──► Set status = rejected, approved_by = current_user, rejection_reason = input
    └──► Decrement allocation.pending_days (minimum 0)
```

**Key Business Rules:**
- Only pending leaves can be updated or cancelled
- Only pending leaves can be approved or rejected
- Leave balance is tracked per (employee, leave_type, year) triple
- Used + Pending cannot exceed Total
- Approved leaves automatically update attendance status

---

## 10. Build, Run & Deploy

### 10.1 Local Development (without Docker)

**Prerequisites:** Go 1.26+, Node.js 20+, PostgreSQL 16, ZKTeco software (for MDB import, Windows only)

**Backend:**
```bash
go build -o hrhub.exe ./cmd/server
.\hrhub.exe          # runs on :5000 (from .env or default)
```

**Frontend:**
```bash
cd web
npm install
npm run dev          # runs on :3000
```

**Swagger Regeneration:**
```powershell
& "C:\Users\SHAKIL\go\bin\swag.exe" init -g cmd/server/main.go -o docs
```

### 10.2 Local Development (with Docker)

```bash
docker-compose up --build
```
- PostgreSQL: `:5432`
- Backend API: `:5000`
- Frontend: `:3000`
- Swagger: `http://localhost:5000/swagger/index.html`

### 10.3 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=shakil
DB_PASS=123456
DB_NAME=hrhub
DB_SSLMODE=disable

# API Server
PORT=5000
JWT_SECRET=hrhub-secret-key-change-in-production-2024

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 10.4 Seed Procedures

| Command | Purpose |
|---------|---------|
| `go run cmd/seed/main.go` | Geo data: divisions, districts, upazilas, unions (fetches remote JSON, idempotent) |
| `go run cmd/superadmin/main.go` | Creates superadmin role + all permissions + superadmin user. Env: `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME` |
| `go run cmd/seed/organization/main.go` | Company (HRHub Technologies Ltd.), 4 branches, 12 departments, 20 sections, 27 designations, production lines, groups A-D, floors 1-10, 5 shifts |
| `go run cmd/seed/leave/main.go` | 8 default leave types: AL, SL, CL, ML, PL, EL, STL, HL |
| `go run cmd/seed/employee/main.go` | Sample employees |

---

## 11. Coding Standards & Conventions

### 11.1 Backend (Go)
- **Models:** GORM struct tags for JSON + DB. Use `datatypes.JSON` for flexible settings.
- **Repositories:** One file per aggregate. Methods: `Create`, `FindByID`, `List`, `Update`, `Delete`. Use GORM `Preload()` for relations.
- **Handlers:** One file per domain. Use `gin.Context` binding (`ShouldBindJSON`). Return proper HTTP status codes (201 for create, 200 for OK, 400 for validation, 401 for auth, 403 for permission, 404 for not found, 409 for conflict, 500 for server error).
- **Swagger:** Every handler method must have `godoc` comments with `@Summary`, `@Description`, `@Tags`, `@Security`, `@Param`, `@Success`, `@Failure`, `@Router`.
- **Error Handling:** Return errors to client as `gin.H{"error": "message"}`. Do not swallow errors silently.
- **Naming:** Handler methods use PascalCase (exported). Request DTOs named `CreateXxxRequest`, `UpdateXxxRequest`.

### 11.2 Frontend (TypeScript/React)
- **Pages:** Server or Client components in `app/(root)/` or `app/(auth)/`.
- **Data Fetching:** Use `lib/api.ts` functions. Do not call axios directly from pages.
- **Tables:** Use `<DataTable>` component with `ColumnDef` from TanStack Table.
- **Forms:** Use React Hook Form + Zod validators when possible.
- **State:** React `useState` + `useEffect` for local state. No global state manager currently.
- **Styling:** Tailwind utility classes. Use `cn()` from `lib/utils.ts` for conditional classes.
- **Icons:** Lucide React.

---

## 12. Known Issues & Limitations

| Issue | Severity | Description |
|-------|----------|-------------|
| **Windows-only MDB Reader** | High | Biometric import requires Windows + PowerShell + ACE.OLEDB.12.0. Cannot run on Linux containers for production. |
| **No DB Foreign Keys** | High | All referential integrity is application-level. Data corruption possible via direct DB access. |
| **Dual Employee Key** | High | `employees.id` (UUID) vs `employee_id` (varchar) confusion. Attendance/salary/leaves use varchar key without FK. |
| ~~**RBAC Not Enforced**~~ | ~~High~~ | ✅ **FIXED** — `RequireRole("super_admin")` now applied to destructive endpoints: `/database/reset`, `/database/import`, `/database/backup`, `/attendance/delete-all`, `/data-logs/delete-all`. |
| ~~**AuditLog Unused**~~ | ~~Medium~~ | ✅ **FIXED** — `middleware/audit.go` captures all POST/PUT/PATCH/DELETE operations and writes to `audit_logs` asynchronously. |
| **No Rate Limiting** | Medium | API has no rate limiting. Brute force on login is possible. |
| **GORM UUID Override Hack** | Low | `postgres.go` runs ALTER statements after every migration to fix GORM type mapping. |
| **Salary Calculation Hardcoded** | Low | Basic (50%), HRA (25%), Medical (10%) are hardcoded ratios. No configuration table exists. |
| **No Caching Layer** | Low | Every request hits PostgreSQL directly. Geo/org lookups repeat constantly. |
| **Salary PF/Tax Placeholders** | Low | Provident Fund and Tax are always 0. No calculation logic implemented. |
| **Client-Side Rendering Only** | Low | All data pages fetch on mount. No SSR/SSG for dashboard or reports. |
| **Frontend any Types** | Low | Some TanStack column accessors use `(r: any)` instead of proper generics. |
| ~~**Missing DB Indexes**~~ | ~~Low~~ | ✅ **FIXED** — 9 performance indexes auto-created on startup for salaries, employees, leave_allocations, temporary_shifts, data_logs, attendances, leaves, sessions. |

---

## 13. Security Model

| Layer | Implementation |
|-------|---------------|
| **Transport** | HTTP (dev) / HTTPS (production intended) |
| **Auth** | JWT Bearer tokens, 15-min access + 7-day refresh |
| **Password Storage** | bcrypt hashing |
| **Password Policy** | Min 12 chars, history enforcement, account lockout schema ready |
| **Session Management** | Refresh tokens stored as SHA256 hashes. Revocation supported. |
| **CORS** | Enabled via middleware |
| **File Upload** | Saved to `./uploads/`, served via `r.Static("/uploads", "./uploads")` |
| **Database Reset** | Protected endpoint (`POST /database/reset`) that drops all tables. High risk. |

**Vulnerabilities to Address:**
1. RBAC middleware must be applied to routes.
2. Rate limiting on auth endpoints.
3. Input sanitization on all raw SQL queries in repositories.
4. Path traversal checks on file uploads (partially done for backups).
5. Secrets in `.env` should never be committed (`.env.example` is present, verify `.env` is in `.gitignore`).

---

## 14. Module Dependency Map

```
cmd/server/main.go
    └── internal/server/server.go
            ├── internal/config/config.go
            ├── internal/database/postgres.go
            │       └── internal/models/* (35 files)
            ├── internal/auth/jwt.go
            ├── internal/middleware/* (auth, cors, logger, permission)
            ├── internal/routes/routes.go
            │       └── All handlers...
            ├── internal/handlers/* (~25 files)
            │       └── internal/repository/* (~20 files)
            │               └── database.DB (GORM instance)
            ├── internal/service/auth.go
            │       └── internal/repository/user.go, auth.go
            └── internal/service/mdb_reader.go

web/ (Next.js frontend)
    └── lib/api.ts
            └── lib/axios-instance.ts
                    └── Components & Pages
```

---

## 15. Quick Reference: Adding a New Feature

When adding a new domain/feature (e.g., "Loan" or "Advance Salary"):

1. **Model:** Create `internal/models/loan.go` with GORM struct + JSON tags.
2. **Repository:** Create `internal/repository/loan.go` with CRUD + list methods. Reuse patterns from `repository/leave.go`.
3. **Handler:** Create `internal/handlers/loan.go` with request DTOs + HTTP methods + Swagger godoc.
4. **Routes:** Register routes in `internal/routes/routes.go` under `api.Group("/loans")`.
5. **Server Wiring:** Add `loanRepo` and `loanHandler` in `internal/server/server.go`, pass to `routes.Setup()`.
6. **Frontend:**
   - Add API functions in `web/lib/api.ts`
   - Create page in `web/app/(root)/loans/page.tsx`
   - Add sidebar navigation link in layout component
7. **Migration:** Add model to `postgres.go` AutoMigrate list + ALTER if needed.
8. **Swagger:** Regenerate with `swag init`.

**Transaction Rule:** Any handler that updates multiple tables in a single operation must wrap the calls in `database.DB.Transaction(func(tx *gorm.DB) error { ... })` and use `repo.WithTx(tx)` for each repository involved.

**Pagination Rule:** Every list endpoint must use `utils.ParsePagination(c)` and return `utils.NewPaginatedResponse(data, total, p)`.

**DO NOT** create duplicate services, repositories, or utility functions. Search the project first. Extend existing patterns.

---

*Document Version: 2.0*  
*Last Updated: 2026-07-19*
