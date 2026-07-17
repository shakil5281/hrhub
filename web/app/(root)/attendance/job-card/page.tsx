"use client"

import * as React from "react"
import { ClipboardListIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"
import { attendanceApi, companyApi, departmentApi, sectionApi, designationApi, lineApi, groupApi, shiftApi } from "@/lib/api"

interface JobCardRecord {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  total_hours: string | null
  status: string
  late_minutes: number
  employee?: {
    employee_id: string
    name_en: string
    designation_ref?: { name: string }
    phone: string
    joining_date: string
    company?: { company_name_en: string }
  }
}

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }
interface Section { id: string; name: string }
interface Designation { id: string; name: string }
interface Line { id: string; name: string }
interface Group { id: string; name: string }
interface Shift { id: string; name: string }

const today = new Date().toISOString().split("T")[0]

const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  late: "bg-orange-100 text-orange-800",
  absent: "bg-red-100 text-red-800",
  half_day: "bg-yellow-100 text-yellow-800",
  holiday: "bg-blue-100 text-blue-800",
  leave: "bg-indigo-100 text-indigo-800",
  on_leave: "bg-indigo-100 text-indigo-800",
  weekend: "bg-purple-100 text-purple-800",
}

const statusTotalsColor: Record<string, string> = {
  present: "text-green-600",
  late: "text-orange-600",
  absent: "text-red-600",
  half_day: "text-yellow-600",
  holiday: "text-blue-600",
  leave: "text-indigo-600",
  on_leave: "text-indigo-600",
  weekend: "text-purple-600",
}

export default function JobCardPage() {
  const [data, setData] = React.useState<JobCardRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [filters, setFilters] = React.useState<Record<string, string>>({
    start_date: today,
    end_date: today,
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
    }).catch(() => {})
  }, [])

  const filterDefs: FilterDef[] = React.useMemo(() => [
    { key: "date_range", label: "Date Range", type: "daterange-split", dateRangeKeys: { start: "start_date", end: "end_date" } },
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
    { key: "employee_id", label: "Employee ID", type: "text", placeholder: "Enter employee code..." },
  ], [companies, departments, sections, designations, lines, groups, shifts])

  const fetchData = async (f?: Record<string, string>) => {
    setLoading(true)
    setError("")
    try {
      const params = f || filters
      const active: Record<string, string> = {}
      if (params.start_date) active.start_date = params.start_date
      if (params.end_date) active.end_date = params.end_date
      if (params.company_id) active.company_id = params.company_id
      if (params.department_id) active.department_id = params.department_id
      if (params.section_id) active.section_id = params.section_id
      if (params.designation_id) active.designation_id = params.designation_id
      if (params.line_id) active.line_id = params.line_id
      if (params.group_id) active.group_id = params.group_id
      if (params.shift_id) active.shift_id = params.shift_id
      if (params.employee_id) active.employee_id = params.employee_id
      if (params.status) active.status = params.status
      const { data: res } = await attendanceApi.jobCard(active)
      setData(res.attendances || [])
    } catch {
      setError("Failed to load job card data")
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    setSubmitting(true)
    fetchData(filters).finally(() => setSubmitting(false))
  }

  const handleReset = () => {
    setFilters({ start_date: today, end_date: today })
    setData([])
    setError("")
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const emp = data.length > 0 ? data[0].employee : null
  const totalByStatus = data.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})
  const totalLateMinutes = data.reduce((sum, r) => sum + (r.late_minutes || 0), 0)

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Card</h1>
            <p className="text-muted-foreground mt-1">Employee attendance job card report</p>
          </div>
        </div>
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

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          {emp && (
            <div className="border-b bg-muted/30 px-4 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{emp.name_en}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Code: </span>
                  <span className="font-medium">{emp.employee_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Designation: </span>
                  <span className="font-medium">{emp.designation_ref?.name || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Company: </span>
                  <span className="font-medium">{emp.company?.company_name_en || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">{emp.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Joining: </span>
                  <span className="font-medium">{emp.joining_date ? format(new Date(emp.joining_date), "dd MMM yyyy") : "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Period: </span>
                  <span className="font-medium">
                    {filters.start_date
                      ? (() => {
                          const fmt = (d: string) => {
                            const p = d.split("-")
                            return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : d
                          }
                          return `${fmt(filters.start_date)} - ${fmt(filters.end_date || filters.start_date)}`
                        })()
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Days: </span>
                  <span className="font-medium">{data.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10">Sl</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Day</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">In Time</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Out Time</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Hours</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Late (min)</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      No data found. Click &quot;Apply&quot; to load attendance.
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{format(new Date(row.date), "dd MMM yyyy")}</td>
                      <td className="px-3 py-2">{format(new Date(row.date), "EEE")}</td>
                      <td className="px-3 py-2">{row.check_in || "-"}</td>
                      <td className="px-3 py-2">{row.check_out || "-"}</td>
                      <td className="px-3 py-2">{row.total_hours || "-"}</td>
                      <td className="px-3 py-2">{row.late_minutes > 0 ? row.late_minutes : "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                            statusColors[row.status] || "bg-gray-100 text-gray-800"
                          )}
                        >
                          {row.status === "on_leave" ? "Leave" : row.status === "half_day" ? "Half Day" : row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data.length > 0 && (
            <div className="border-t bg-muted/30 px-4 py-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Days: </span>
                  <span className="font-medium">{data.length}</span>
                </div>
                {Object.entries(totalByStatus).map(([status, count]) => (
                  <div key={status}>
                    <span className="text-muted-foreground">
                      {status === "on_leave" ? "Leave" : status === "half_day" ? "Half Day" : status.charAt(0).toUpperCase() + status.slice(1)}:{" "}
                    </span>
                    <span className={cn("font-medium", statusTotalsColor[status] || "text-foreground")}>
                      {count}
                    </span>
                  </div>
                ))}
                <div>
                  <span className="text-muted-foreground">Total Late Minutes: </span>
                  <span className="font-medium">{totalLateMinutes}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
