"use client"

import * as React from "react"
import { FileTextIcon, SearchIcon, RotateCcwIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  DailySummary, getDailySummaries,
  companyOptions, departmentOptions, lineOptions,
} from "@/components/daily-summary-data"

const columns: ColumnDef<DailySummary>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "company", header: "Company" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "line", header: "Line" },
  { accessorKey: "present", header: "Present" },
  { accessorKey: "late", header: "Late" },
  { accessorKey: "absent", header: "Absent" },
  { accessorKey: "halfDay", header: "Half Day" },
  { accessorKey: "leave", header: "Leave" },
  { accessorKey: "holiday", header: "Holiday" },
  { accessorKey: "total", header: "Total" },
]

export default function DailySummaryPage() {
  const [data, setData] = React.useState<DailySummary[]>([])
  React.useEffect(() => setData(getDailySummaries()), [])

  const [dateFrom, setDateFrom] = React.useState<Date | undefined>()
  const [dateTo, setDateTo] = React.useState<Date | undefined>()
  const [companyFilter, setCompanyFilter] = React.useState("all")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [lineFilter, setLineFilter] = React.useState("all")

  const [applyKey, setApplyKey] = React.useState(0)
  const [applied, setApplied] = React.useState<{
    dateFrom: Date | undefined; dateTo: Date | undefined; company: string; department: string; line: string
  } | null>(null)

  const filtered = React.useMemo(() => {
    if (!applied) return data
    let result = data
    if (applied.dateFrom) result = result.filter((r) => new Date(r.date) >= applied.dateFrom!)
    if (applied.dateTo) {
      const end = new Date(applied.dateTo)
      end.setHours(23, 59, 59, 999)
      result = result.filter((r) => new Date(r.date) <= end)
    }
    if (applied.company !== "all") result = result.filter((r) => r.company === applied.company)
    if (applied.department !== "all") result = result.filter((r) => r.department === applied.department)
    if (applied.line !== "all") result = result.filter((r) => r.line === applied.line)
    return result
  }, [data, applied])

  const applyFilters = () => { setApplied({ dateFrom, dateTo, company: companyFilter, department: deptFilter, line: lineFilter }); setApplyKey((k) => k + 1) }

  const resetFilters = () => {
    setDateFrom(undefined); setDateTo(undefined); setCompanyFilter("all"); setDeptFilter("all"); setLineFilter("all")
    setApplied(null); setApplyKey((k) => k + 1)
  }

  const hasAnyValue = dateFrom || dateTo || companyFilter !== "all" || deptFilter !== "all" || lineFilter !== "all"

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daily Summary</h1>
            <p className="text-muted-foreground mt-1">Daily attendance summary reports</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">From Date</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">To Date</label>
              <DatePicker value={dateTo} onChange={setDateTo} placeholder="To date" />
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
              <label className="text-xs font-medium text-muted-foreground">Line</label>
              <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Lines</option>
                {lineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
