"use client"

import * as React from "react"
import { ClockIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"
import { attendanceApi, companyApi, departmentApi, sectionApi, designationApi, lineApi, groupApi, shiftApi } from "@/lib/api"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface OvertimeRecord {
  id: string
  employee_id: string
  employee_name: string
  emp_id: string
  date: string
  check_in: string
  check_out: string
  total_hours: string
}

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }
interface Section { id: string; name: string }
interface Designation { id: string; name: string }
interface Line { id: string; name: string }
interface Group { id: string; name: string }
interface Shift { id: string; name: string }

const columns: ColumnDef<OvertimeRecord>[] = [
  { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
  { accessorKey: "employee_name", header: "Employee Name" },
  { accessorKey: "emp_id", header: "Emp. ID" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "check_in", header: "Check In" },
  { accessorKey: "check_out", header: "Check Out" },
  { accessorKey: "total_hours", header: "Total Hours" },
]

const today = new Date().toISOString().split("T")[0]

export default function OverTimeSheetPage() {
  const [data, setData] = React.useState<OvertimeRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [filters, setFilters] = React.useState<Record<string, string>>({
    date: today,
  })
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [lines, setLines] = React.useState<Line[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])
  const [shifts, setShifts] = React.useState<Shift[]>([])

  React.useEffect(() => {
    Promise.all([
      companyApi.list(),
      departmentApi.list(),
      sectionApi.list(),
      designationApi.list(),
      lineApi.list(),
      groupApi.list(),
      shiftApi.list(),
    ]).then(([cRes, dRes, secRes, desRes, lRes, gRes, sRes]) => {
      setCompanies(cRes.data || [])
      setDepartments(dRes.data || [])
      setSections(secRes.data || [])
      setDesignations(desRes.data || [])
      setLines(lRes.data || [])
      setGroups(gRes.data || [])
      setShifts(sRes.data || [])
      fetchData({ date: today })
    }).catch(() => {})
  }, [])

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
      key: "status", label: "Status", type: "select", options: [
        { value: "present", label: "Present" },
        { value: "late", label: "Late" },
        { value: "absent", label: "Absent" },
        { value: "half_day", label: "Half Day" },
      ],
    },
  ], [companies, departments, sections, designations, lines, groups, shifts])

  const fetchData = async (f?: Record<string, string>) => {
    setLoading(true)
    try {
      const params = f || filters
      const active: Record<string, string> = {}
      const date = params.date || today
      active.start_date = date
      active.end_date = date
      if (params.company_id) active.company_id = params.company_id
      if (params.department_id) active.department_id = params.department_id
      if (params.section_id) active.section_id = params.section_id
      if (params.designation_id) active.designation_id = params.designation_id
      if (params.line_id) active.line_id = params.line_id
      if (params.group_id) active.group_id = params.group_id
      if (params.shift_id) active.shift_id = params.shift_id
      if (params.status) active.status = params.status
      const { data: res } = await attendanceApi.overtime(active)
      setData(res.records || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    setSubmitting(true)
    fetchData(filters).finally(() => setSubmitting(false))
  }

  const handleReset = () => {
    setFilters({ date: today })
    setData([])
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Over Time Sheet</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage overtime records and sheets</p>
      </div>

      <div className="px-4 lg:px-6">
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={handleFilterChange}
          onApply={handleApply}
          onReset={handleReset}
          submitting={submitting}
        />
      </div>

      {loading ? (
        <div className="px-4 lg:px-6">
          <div className="rounded-lg border bg-card p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  )
}
