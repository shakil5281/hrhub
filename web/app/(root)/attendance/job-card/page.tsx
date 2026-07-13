"use client"

import * as React from "react"
import { IdCardIcon, SearchIcon, RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, Building2Icon, UsersIcon, BriefcaseIcon, LayoutListIcon, LayersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { JobCardRecord, getJobCardRecords, getEmployees, companyOptions, departmentOptions, designationOptions, lineOptions, sectionOptions, groupOptions } from "@/components/job-card-data"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Present: "default", Late: "destructive", Absent: "destructive",
  "Half Day": "secondary", Holiday: "outline", Leave: "secondary",
}

export default function JobCardPage() {
  const [records, setRecords] = React.useState<JobCardRecord[]>([])
  const [allEmployees] = React.useState(() => getEmployees())
  React.useEffect(() => setRecords(getJobCardRecords()), [])

  const [companyFilter, setCompanyFilter] = React.useState("all")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [desigFilter, setDesigFilter] = React.useState("all")
  const [lineFilter, setLineFilter] = React.useState("all")
  const [sectionFilter, setSectionFilter] = React.useState("all")
  const [groupFilter, setGroupFilter] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>()
  const [dateTo, setDateTo] = React.useState<Date | undefined>()

  const [applied, setApplied] = React.useState<{
    company: string; department: string; designation: string; line: string; section: string; group: string
    from: Date | undefined; to: Date | undefined
  } | null>(null)

  const [currentIndex, setCurrentIndex] = React.useState(0)

  const matchedEmployees = React.useMemo(() => {
    if (!applied) return []
    let result = allEmployees
    if (applied.company !== "all") result = result.filter((e) => e.company === applied.company)
    if (applied.department !== "all") result = result.filter((e) => e.department === applied.department)
    if (applied.designation !== "all") result = result.filter((e) => e.designation === applied.designation)
    if (applied.line !== "all") result = result.filter((e) => e.line === applied.line)
    if (applied.section !== "all") result = result.filter((e) => e.section === applied.section)
    if (applied.group !== "all") result = result.filter((e) => e.group === applied.group)
    return result
  }, [allEmployees, applied])

  const currentEmp = matchedEmployees[currentIndex] || null

  const attendanceRecords = React.useMemo(() => {
    if (!currentEmp || !applied) return []
    let result = records.filter((r) => r.employeeCode === currentEmp.employeeCode)
    if (applied.from) result = result.filter((r) => new Date(r.date) >= applied.from!)
    if (applied.to) {
      const end = new Date(applied.to)
      end.setHours(23, 59, 59, 999)
      result = result.filter((r) => new Date(r.date) <= end)
    }
    result.sort((a, b) => a.date.localeCompare(b.date))
    return result
  }, [records, currentEmp, applied])

  const summary = React.useMemo(() => {
    if (!attendanceRecords.length) return null
    const total = attendanceRecords.length
    const present = attendanceRecords.filter((r) => r.status === "Present").length
    const late = attendanceRecords.filter((r) => r.status === "Late").length
    const absent = attendanceRecords.filter((r) => r.status === "Absent").length
    const halfDay = attendanceRecords.filter((r) => r.status === "Half Day").length
    const leave = attendanceRecords.filter((r) => r.status === "Leave").length
    const holiday = attendanceRecords.filter((r) => r.status === "Holiday").length
    return { total, present, late, absent, halfDay, leave, holiday }
  }, [attendanceRecords])

  const hasAnyValue = companyFilter !== "all" || deptFilter !== "all" || desigFilter !== "all" || lineFilter !== "all" || sectionFilter !== "all" || groupFilter !== "all" || dateFrom || dateTo
  const isFilterReady = companyFilter !== "all" || deptFilter !== "all" || desigFilter !== "all" || lineFilter !== "all" || sectionFilter !== "all" || groupFilter !== "all"

  const applyFilters = () => {
    setApplied({ company: companyFilter, department: deptFilter, designation: desigFilter, line: lineFilter, section: sectionFilter, group: groupFilter, from: dateFrom, to: dateTo })
    setCurrentIndex(0)
  }

  const resetFilters = () => {
    setCompanyFilter("all"); setDeptFilter("all"); setDesigFilter("all"); setLineFilter("all"); setSectionFilter("all"); setGroupFilter("all")
    setDateFrom(undefined); setDateTo(undefined); setApplied(null); setCurrentIndex(0)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <IdCardIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Card</h1>
            <p className="text-muted-foreground mt-1">Employee wise daily attendance record</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
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
              <label className="text-xs font-medium text-muted-foreground">Section</label>
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Sections</option>
                {sectionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
              <label className="text-xs font-medium text-muted-foreground">From Date</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Start date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">To Date</label>
              <DatePicker value={dateTo} onChange={setDateTo} placeholder="End date" />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            {hasAnyValue && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcwIcon className="mr-1 size-3.5" />
                Reset
              </Button>
            )}
            <Button size="sm" onClick={applyFilters} disabled={!isFilterReady}>
              <SearchIcon className="mr-1 size-3.5" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {applied && matchedEmployees.length === 0 && (
        <div className="px-4 lg:px-6">
          <p className="text-sm text-muted-foreground text-center py-8">No employees match the selected filters.</p>
        </div>
      )}

      {applied && matchedEmployees.length > 0 && currentEmp && (
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">{matchedEmployees.length} employee(s) found</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
                <ChevronLeftIcon className="size-4" />
                Previous
              </Button>
              <span className="text-sm font-medium tabular-nums">{currentIndex + 1} of {matchedEmployees.length}</span>
              <Button variant="outline" size="sm" disabled={currentIndex === matchedEmployees.length - 1} onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Employee</p>
                <p className="text-sm font-medium">{currentEmp.employee}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IdCardIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Code</p>
                <p className="text-sm font-medium">{currentEmp.employeeCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2Icon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-medium">{currentEmp.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium">{currentEmp.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LayersIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="text-sm font-medium">{currentEmp.designation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LayoutListIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Line</p>
                <p className="text-sm font-medium">{currentEmp.line}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LayoutListIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Section</p>
                <p className="text-sm font-medium">{currentEmp.section}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Group</p>
                <p className="text-sm font-medium">{currentEmp.group}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left px-3 py-2.5 font-medium">Date</th>
                  <th className="text-left px-3 py-2.5 font-medium">Shift</th>
                  <th className="text-left px-3 py-2.5 font-medium">InTime</th>
                  <th className="text-left px-3 py-2.5 font-medium">OutTime</th>
                  <th className="text-left px-3 py-2.5 font-medium">Late</th>
                  <th className="text-left px-3 py-2.5 font-medium">OverTime</th>
                  <th className="text-left px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No attendance records for the selected date range.</td>
                  </tr>
                ) : (
                  attendanceRecords.map((r, i) => (
                    <tr key={r.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/30"}`}>
                      <td className="px-3 py-2">{r.date}</td>
                      <td className="px-3 py-2">{r.shift}</td>
                      <td className="px-3 py-2">{r.inTime}</td>
                      <td className="px-3 py-2">{r.outTime}</td>
                      <td className="px-3 py-2">{r.late}</td>
                      <td className="px-3 py-2">{r.overTime}</td>
                      <td className="px-3 py-2">
                        <Badge variant={statusVariant[r.status] || "secondary"} className="capitalize">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {summary && (
            <div className="mt-4 rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Summary</h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                <div className="text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{summary.total}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Present</p><p className="text-lg font-bold text-green-600">{summary.present}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Late</p><p className="text-lg font-bold text-orange-600">{summary.late}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Absent</p><p className="text-lg font-bold text-red-600">{summary.absent}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Half Day</p><p className="text-lg font-bold text-amber-600">{summary.halfDay}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Leave</p><p className="text-lg font-bold text-blue-600">{summary.leave}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Holiday</p><p className="text-lg font-bold text-purple-600">{summary.holiday}</p></div>
              </div>
            </div>
          )}
        </div>
      )}

      {!applied && (
        <div className="px-4 lg:px-6">
          <p className="text-sm text-muted-foreground text-center py-8">Select filters and click Search to view employee job cards.</p>
        </div>
      )}
    </div>
  )
}
