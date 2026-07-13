"use client"

import * as React from "react"
import { ClipboardCheckIcon, RotateCcwIcon, SearchIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DailyAttendance, getDailyAttendance,
  companyOptions, departmentOptions, designationOptions, lineOptions, groupOptions, attendanceStatusOptions,
} from "@/components/daily-attendance-data"

const columns: ColumnDef<DailyAttendance>[] = [
  { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
  { accessorKey: "employeeCode", header: "EmployeeId" },
  { accessorKey: "employee", header: "EmployeeName" },
  { accessorKey: "checkIn", header: "InTime" },
  { accessorKey: "checkOut", header: "OutTime" },
  { accessorKey: "late", header: "Late" },
  { accessorKey: "overTime", header: "OverTime" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const map: Record<string, "default" | "secondary" | "destructive"> = { Present: "default", Late: "destructive", Absent: "destructive", "Half Day": "secondary", Holiday: "secondary", Leave: "secondary" }
      return <Badge variant={map[row.original.status]}>{row.original.status}</Badge>
    },
  },
]

export default function DailyAttendancePage() {
  const [data, setData] = React.useState<DailyAttendance[]>([])
  React.useEffect(() => setData(getDailyAttendance()), [])

  const [employeeId, setEmployeeId] = React.useState("")
  const [companyFilter, setCompanyFilter] = React.useState("all")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [desigFilter, setDesigFilter] = React.useState("all")
  const [lineFilter, setLineFilter] = React.useState("all")
  const [groupFilter, setGroupFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const [applyKey, setApplyKey] = React.useState(0)
  const [applied, setApplied] = React.useState<{
    employeeId: string; company: string; department: string; designation: string; line: string; group: string; status: string
  } | null>(null)

  const filtered = React.useMemo(() => {
    if (!applied) return data
    let result = data
    if (applied.employeeId.trim()) result = result.filter((r) => r.employeeCode.toLowerCase().includes(applied.employeeId.toLowerCase()))
    if (applied.company !== "all") result = result.filter((r) => r.company === applied.company)
    if (applied.department !== "all") result = result.filter((r) => r.department === applied.department)
    if (applied.designation !== "all") result = result.filter((r) => r.designation === applied.designation)
    if (applied.line !== "all") result = result.filter((r) => r.line === applied.line)
    if (applied.group !== "all") result = result.filter((r) => r.group === applied.group)
    if (applied.status !== "all") result = result.filter((r) => r.status === applied.status)
    return result
  }, [data, applied])

  const applyFilters = () => { setApplied({ employeeId, company: companyFilter, department: deptFilter, designation: desigFilter, line: lineFilter, group: groupFilter, status: statusFilter }); setApplyKey((k) => k + 1) }

  const resetFilters = () => {
    setEmployeeId(""); setCompanyFilter("all"); setDeptFilter("all"); setDesigFilter("all")
    setLineFilter("all"); setGroupFilter("all"); setStatusFilter("all")
    setApplied(null); setApplyKey((k) => k + 1)
  }

  const hasAnyValue = employeeId || companyFilter !== "all" || deptFilter !== "all" || desigFilter !== "all" || lineFilter !== "all" || groupFilter !== "all" || statusFilter !== "all"

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
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
              <Input placeholder="Enter employee code" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company</label>
              <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Companies</option>
                {companyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Departments</option>
                {departmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Designation</label>
              <select value={desigFilter} onChange={(e) => setDesigFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Designations</option>
                {designationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Line</label>
              <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Lines</option>
                {lineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Group</label>
              <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Groups</option>
                {groupOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Statuses</option>
                {attendanceStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            {hasAnyValue && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcwIcon className="mr-1 size-3.5" />
                Reset
              </Button>
            )}
            <Button size="sm" onClick={applyFilters}>
              <SearchIcon className="mr-1 size-3.5" />
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      <DataTable key={applyKey} data={filtered} columns={columns} />
    </div>
  )
}
