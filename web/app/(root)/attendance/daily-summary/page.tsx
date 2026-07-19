"use client"

import * as React from "react"
import { FileTextIcon, Loader2 } from "lucide-react"
import { attendanceApi, companyApi, departmentApi, sectionApi, designationApi, lineApi, groupApi, shiftApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }
interface Section { id: string; name: string }
interface Designation { id: string; name: string }
interface Line { id: string; name: string }
interface Group { id: string; name: string }
interface Shift { id: string; name: string }

interface SummaryRecord {
  id: string
  date?: string
  name?: string
  present: number
  late: number
  absent: number
  half_day: number
  on_leave?: number
  weekend?: number
  total: number
}

const today = new Date().toISOString().split("T")[0]

const groupTabs = [
  { value: "department", label: "Department" },
  { value: "section", label: "Section" },
  { value: "designation", label: "Designation" },
  { value: "line", label: "Line" },
  { value: "group", label: "Custom Group" },
]

const statusLabels = [
  { key: "present", label: "Present", color: "text-green-600 bg-green-50" },
  { key: "late", label: "Late", color: "text-orange-600 bg-orange-50" },
  { key: "absent", label: "Absent", color: "text-red-600 bg-red-50" },
  { key: "half_day", label: "Half Day", color: "text-yellow-600 bg-yellow-50" },
  { key: "on_leave", label: "On Leave", color: "text-indigo-600 bg-indigo-50" },
  { key: "weekend", label: "Weekend", color: "text-purple-600 bg-purple-50" },
]

function SummaryTable({ data, loading }: { data: SummaryRecord[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        No records found for the selected period
      </div>
    )
  }

  const grandTotal = data.reduce((s, r) => ({
    present: s.present + r.present,
    late: s.late + r.late,
    absent: s.absent + r.absent,
    half_day: s.half_day + r.half_day,
    on_leave: s.on_leave! + (r.on_leave || 0),
    weekend: s.weekend! + (r.weekend || 0),
    total: s.total + r.total,
  }), { present: 0, late: 0, absent: 0, half_day: 0, on_leave: 0, weekend: 0, total: 0 })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-12">#</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
            {statusLabels.map((s) => (
              <th key={s.key} className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">{s.label}</th>
            ))}
            <th className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id} className={cn("border-b last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 0 && "bg-background")}>
              <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
              <td className="py-2.5 px-4 font-medium">{row.name}</td>
              {statusLabels.map((s) => (
                <td key={s.key} className="py-2.5 px-3 text-center">
                  <span className={cn("inline-block min-w-[28px] px-2 py-0.5 rounded text-xs font-semibold", s.color)}>
                    {(row as any)[s.key] ?? 0}
                  </span>
                </td>
              ))}
              <td className="py-2.5 px-3 text-center font-semibold">{row.total}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-muted bg-muted/20 font-semibold">
            <td className="py-3 px-4 text-muted-foreground" colSpan={1}></td>
            <td className="py-3 px-4">Grand Total</td>
            {statusLabels.map((s) => (
              <td key={s.key} className="py-3 px-3 text-center">
                <span className={cn("inline-block min-w-[28px] px-2 py-0.5 rounded text-xs", s.color)}>
                  {(grandTotal as any)[s.key]}
                </span>
              </td>
            ))}
            <td className="py-3 px-3 text-center">{grandTotal.total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function DailySummaryPage() {
  const [data, setData] = React.useState<SummaryRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [lines, setLines] = React.useState<Line[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])
  const [shifts, setShifts] = React.useState<Shift[]>([])
  const [filters, setFilters] = React.useState<Record<string, string>>({ date: today })
  const [groupBy, setGroupBy] = React.useState("department")

  const filterDefs: FilterDef[] = React.useMemo(() => [
    { key: "date", label: "Date", type: "datepicker" },
    { key: "company_id", label: "Company", type: "select", options: companies.map((c) => ({ value: c.id, label: c.company_name_en })) },
    { key: "department_id", label: "Department", type: "select", options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { key: "section_id", label: "Section", type: "select", options: sections.map((s) => ({ value: s.id, label: s.name })) },
    { key: "designation_id", label: "Designation", type: "select", options: designations.map((d) => ({ value: d.id, label: d.name })) },
    { key: "line_id", label: "Line", type: "select", options: lines.map((l) => ({ value: l.id, label: l.name })) },
    { key: "group_id", label: "Group", type: "select", options: groups.map((g) => ({ value: g.id, label: g.name })) },
    { key: "shift_id", label: "Shift", type: "select", options: shifts.map((s) => ({ value: s.id, label: s.name })) },
    { key: "status", label: "Status", type: "select", options: [
      { value: "present", label: "Present" }, { value: "late", label: "Late" },
      { value: "absent", label: "Absent" }, { value: "half_day", label: "Half Day" },
    ] },
    { key: "employee_id", label: "Employee ID", type: "text", placeholder: "Enter employee code..." },
  ], [companies, departments, sections, designations, lines, groups, shifts])

  const fetchData = React.useCallback(async (params: Record<string, string>, gb: string) => {
    setLoading(true)
    setError("")
    try {
      const apiParams: Record<string, string> = { start_date: params.date || today, end_date: params.date || today }
      if (gb) apiParams.group_by = gb
      ;["company_id", "department_id", "section_id", "designation_id", "line_id", "group_id", "shift_id", "status"].forEach((k) => { if (params[k]) apiParams[k] = params[k] })
      const { data: res } = await attendanceApi.summary(apiParams)
      setData((res?.summaries || []).map((r: any, i: number) => ({ ...r, id: r.entity_id || r.id || `row-${i}` })))
    } catch {
      setError("Failed to load summary")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const init = async () => {
      const [cRes, dRes, secRes, desRes, lRes, gRes, sRes] = await Promise.all([
        companyApi.list({ limit: "100" }), departmentApi.list({ limit: "100" }),
        sectionApi.list(undefined, { limit: "100" }), designationApi.list(undefined, { limit: "100" }),
        lineApi.list(undefined, { limit: "100" }), groupApi.list({ limit: "100" }), shiftApi.list({ limit: "100" }),
      ])
      if (Array.isArray(cRes.data?.data)) setCompanies(cRes.data.data)
      if (Array.isArray(dRes.data?.data)) setDepartments(dRes.data.data)
      if (Array.isArray(secRes.data?.data)) setSections(secRes.data.data)
      if (Array.isArray(desRes.data?.data)) setDesignations(desRes.data.data)
      if (Array.isArray(lRes.data?.data)) setLines(lRes.data.data)
      if (Array.isArray(gRes.data?.data)) setGroups(gRes.data.data)
      if (Array.isArray(sRes.data?.data)) setShifts(sRes.data.data)
    }
    init()
    fetchData({ date: today }, "")
  }, [])

  const handleTabChange = (value: string) => { setGroupBy(value); fetchData(filters, value) }
  const handleChange = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const handleApply = () => {
    const active: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) { if (v) active[k] = v }
    fetchData(active, groupBy)
  }

  const handleReset = () => {
    const rf = { date: today }
    setFilters(rf)
    fetchData(rf, groupBy)
  }

  const tabLabel = groupTabs.find((t) => t.value === groupBy)?.label || ""

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
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
            <h2 className="text-base font-semibold">
              {tabLabel} Summary
            </h2>
            <Tabs value={groupBy} onValueChange={handleTabChange}>
              <TabsList className="h-8">
                {groupTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="h-7 px-3 text-xs">{tab.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <Tabs value={groupBy}>
            <TabsContent value={groupBy} className="mt-0">
              <SummaryTable data={data} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
