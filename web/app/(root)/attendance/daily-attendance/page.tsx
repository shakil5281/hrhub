"use client"

import * as React from "react"
import { ClipboardCheckIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { attendanceApi, companyApi, departmentApi, sectionApi, designationApi, lineApi, groupApi, shiftApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }
interface Section { id: string; name: string }
interface Designation { id: string; name: string }
interface Line { id: string; name: string }
interface Group { id: string; name: string }
interface Shift { id: string; name: string }

interface AttendanceRecord {
  id: string
  employee_id: string
  company_id: string
  date: string
  check_in: string | null
  check_out: string | null
  total_hours: string | null
  status: string
  late_minutes: number
  employee?: { employee_code: string; name_en: string; designation: string }
}

const columns: ColumnDef<AttendanceRecord>[] = [
  { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
  {
    accessorKey: "employee_id",
    header: "Employee ID",
    cell: ({ row }) => row.original.employee?.employee_code || row.original.employee_id.slice(0, 8),
  },
  {
    accessorKey: "employee.name_en",
    header: "Name",
    cell: ({ row }) => row.original.employee?.name_en || "-",
  },

  { accessorKey: "check_in", header: "Check In" },
  { accessorKey: "check_out", header: "Check Out" },
  { accessorKey: "total_hours", header: "Total Hours" },
  { accessorKey: "late_minutes", header: "Late (min)" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const variant = row.original.status === "present" ? "default" : row.original.status === "late" ? "destructive" : "secondary"
      return <Badge variant={variant} className="capitalize">{row.original.status}</Badge>
    },
  },
]

const today = new Date().toISOString().split("T")[0]

export default function DailyAttendancePage() {
  const [data, setData] = React.useState<AttendanceRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [lines, setLines] = React.useState<Line[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])
  const [shifts, setShifts] = React.useState<Shift[]>([])
  const [filters, setFilters] = React.useState<Record<string, string>>({
    date: today,
  })

  const filterDefs: FilterDef[] = React.useMemo(() => [
    { key: "date", label: "Date", type: "datepicker" },
    {
      key: "company_id", label: "Company", type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.company_name_en })),
    },
    {
      key: "department_id", label: "Department", type: "select",
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      key: "section_id", label: "Section", type: "select",
      options: sections.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      key: "designation_id", label: "Designation", type: "select",
      options: designations.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      key: "line_id", label: "Line", type: "select",
      options: lines.map((l) => ({ value: l.id, label: l.name })),
    },
    {
      key: "group_id", label: "Group", type: "select",
      options: groups.map((g) => ({ value: g.id, label: g.name })),
    },
    {
      key: "shift_id", label: "Shift", type: "select",
      options: shifts.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { value: "present", label: "Present" },
        { value: "late", label: "Late" },
        { value: "absent", label: "Absent" },
        { value: "half_day", label: "Half Day" },
      ],
    },
    { key: "employee_id", label: "Employee ID", type: "text", placeholder: "Enter employee code..." },
  ], [companies, departments, sections, designations, lines, groups, shifts])

  const fetchData = React.useCallback(async (params: Record<string, string>) => {
    setLoading(true)
    setError("")
    try {
      const { data: res } = await attendanceApi.list(params)
      setData(Array.isArray(res) ? res : [])
    } catch {
      setError("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const init = async () => {
      const [cRes, dRes, secRes, desRes, lRes, gRes, sRes] = await Promise.all([
        companyApi.list(),
        departmentApi.list(),
        sectionApi.list(),
        designationApi.list(),
        lineApi.list(),
        groupApi.list(),
        shiftApi.list(),
      ])
      if (Array.isArray(cRes.data)) setCompanies(cRes.data)
      if (Array.isArray(dRes.data)) setDepartments(dRes.data)
      if (Array.isArray(secRes.data)) setSections(secRes.data)
      if (Array.isArray(desRes.data)) setDesignations(desRes.data)
      if (Array.isArray(lRes.data)) setLines(lRes.data)
      if (Array.isArray(gRes.data)) setGroups(gRes.data)
      if (Array.isArray(sRes.data)) setShifts(sRes.data)
    }
    init()
    fetchData({ date: today })
  }, [])

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    const active: Record<string, string> = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value) active[key] = value
    }
    fetchData(active)
  }

  const handleReset = () => {
    setFilters({ date: today })
    fetchData({ date: today })
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClipboardCheckIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
            <p className="text-muted-foreground mt-1">View and manage daily attendance records</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={handleChange}
          onApply={handleApply}
          onReset={handleReset}
          submitting={loading}
        />
      </div>

      {error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold mb-2">
          Attendance for{" "}
          {filters.date
            ? (() => {
                const parts = filters.date.split("-")
                return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : filters.date
              })()
            : "-"}
        </h2>
      </div>

      {loading ? (
        <div className="px-4 lg:px-6 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  )
}
