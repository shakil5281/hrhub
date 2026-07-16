"use client"

import * as React from "react"
import { UsersIcon, PlusIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Employee, statusOptionsEmployee, genderOptions, bloodGroupOptions } from "@/components/data/employee-data"
import {
  employeeApi,
  companyApi,
  departmentApi,
  sectionApi,
  designationApi,
  lineApi,
  shiftApi,
  groupApi,
  floorApi,
} from "@/lib/api"

interface Company {
  id: string
  company_name_en: string
}
interface Department {
  id: string
  name: string
}
interface Section {
  id: string
  name: string
}
interface Designation {
  id: string
  name: string
}
interface Line {
  id: string
  name: string
}
interface Shift {
  id: string
  name: string
}
interface Group {
  id: string
  name: string
}
interface Floor {
  id: string
  name: string
}

const columns: ColumnDef<Employee>[] = [
  { accessorKey: "employee_code", header: "Code" },
  { accessorKey: "name_en", header: "Name" },
  { accessorKey: "designation", header: "Designation" },
  { accessorKey: "punch_number", header: "Punch No" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "joining_date", header: "Joining Date" },
  {
    accessorKey: "total_salary",
    header: "Salary",
    cell: ({ row }) => row.original.total_salary?.toLocaleString() || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"} className="capitalize">
        {statusOptionsEmployee.find((s) => s.value === row.original.status)?.label}
      </Badge>
    ),
  },
]

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function EmployeesPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  const [filters, setFilters] = React.useState<Record<string, string>>({})

  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [lines, setLines] = React.useState<Line[]>([])
  const [shifts, setShifts] = React.useState<Shift[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])
  const [floors, setFloors] = React.useState<Floor[]>([])

  const fetchEmployees = async (f?: Record<string, string>) => {
    setError("")
    try {
      const { data: res } = await employeeApi.list(f && Object.keys(f).length > 0 ? f : undefined)
      setData(Array.isArray(res) ? res : [])
    } catch {
      setError("Failed to load employees")
    }
  }

  React.useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [compRes, deptRes, shiftRes, groupRes, floorRes] = await Promise.all([
          companyApi.list(),
          departmentApi.list(),
          shiftApi.list(),
          groupApi.list(),
          floorApi.list(),
        ])
        setCompanies(Array.isArray(compRes.data) ? compRes.data : [])
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : [])
        setShifts(Array.isArray(shiftRes.data) ? shiftRes.data : [])
        setGroups(Array.isArray(groupRes.data) ? groupRes.data : [])
        setFloors(Array.isArray(floorRes.data) ? floorRes.data : [])
      } catch {
        // dropdowns will be empty
      }
      await fetchEmployees()
      setLoading(false)
    }
    init()
  }, [])

  const handleDepartmentChange = async (value: string) => {
    setFilters((prev) => ({
      ...prev,
      department_id: value,
      section_id: "",
      designation_id: "",
      line_id: "",
    }))
    if (value) {
      try {
        const { data: secData } = await sectionApi.list(value)
        setSections(Array.isArray(secData) ? secData : [])
      } catch {
        setSections([])
      }
    } else {
      setSections([])
    }
    setDesignations([])
    setLines([])
  }

  const handleSectionChange = async (value: string) => {
    setFilters((prev) => ({
      ...prev,
      section_id: value,
      designation_id: "",
      line_id: "",
    }))
    if (value) {
      try {
        const [desigRes, lineRes] = await Promise.all([
          designationApi.list(value),
          lineApi.list(value),
        ])
        setDesignations(Array.isArray(desigRes.data) ? desigRes.data : [])
        setLines(Array.isArray(lineRes.data) ? lineRes.data : [])
      } catch {
        setDesignations([])
        setLines([])
      }
    } else {
      setDesignations([])
      setLines([])
    }
  }

  const handleApply = async () => {
    setSubmitting(true)
    setError("")
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""))
    await fetchEmployees(active)
    setSubmitting(false)
  }

  const handleReset = async () => {
    setFilters({})
    setSections([])
    setDesignations([])
    setLines([])
    setError("")
    setSubmitting(true)
    await fetchEmployees()
    setSubmitting(false)
  }

  const handleEdit = (emp: Employee) => router.push(`/hr/employees/${emp.id}/edit`)
  const handleDelete = async (emp: Employee) => {
    try {
      await employeeApi.delete(emp.id)
      setData((prev) => prev.filter((e) => e.id !== emp.id))
    } catch {
      setError("Failed to delete employee")
    }
  }

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage employee records</p>
          </div>
        </div>
        <Button onClick={() => router.push("/hr/employees/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company</label>
              <select
                value={filters.company_id || ""}
                onChange={(e) => setFilter("company_id", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <select
                value={filters.department_id || ""}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Section</label>
              <select
                value={filters.section_id || ""}
                onChange={(e) => handleSectionChange(e.target.value)}
                className={selectClass}
                disabled={!filters.department_id}
              >
                <option value="">— All —</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Designation</label>
              <select
                value={filters.designation_id || ""}
                onChange={(e) => setFilter("designation_id", e.target.value)}
                className={selectClass}
                disabled={!filters.section_id}
              >
                <option value="">— All —</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Line</label>
              <select
                value={filters.line_id || ""}
                onChange={(e) => setFilter("line_id", e.target.value)}
                className={selectClass}
                disabled={!filters.section_id}
              >
                <option value="">— All —</option>
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Shift</label>
              <select
                value={filters.shift_id || ""}
                onChange={(e) => setFilter("shift_id", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Group</label>
              <select
                value={filters.group_id || ""}
                onChange={(e) => setFilter("group_id", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Floor</label>
              <select
                value={filters.floor_id || ""}
                onChange={(e) => setFilter("floor_id", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) => setFilter("status", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {statusOptionsEmployee.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
              <input
                type="text"
                value={filters.employee_code || ""}
                onChange={(e) => setFilter("employee_code", e.target.value)}
                placeholder="Search by code..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                value={filters.gender || ""}
                onChange={(e) => setFilter("gender", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {genderOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Blood Group</label>
              <select
                value={filters.blood_group || ""}
                onChange={(e) => setFilter("blood_group", e.target.value)}
                className={selectClass}
              >
                <option value="">— All —</option>
                {bloodGroupOptions.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Min Salary</label>
              <input
                type="number"
                value={filters.min_salary || ""}
                onChange={(e) => setFilter("min_salary", e.target.value)}
                placeholder="0"
                min="0"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Max Salary</label>
              <input
                type="number"
                value={filters.max_salary || ""}
                onChange={(e) => setFilter("max_salary", e.target.value)}
                placeholder="999999"
                min="0"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleApply} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={submitting}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-4 lg:px-6 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable key={data.length} data={data} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
