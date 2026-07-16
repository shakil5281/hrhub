"use client"

import * as React from "react"
import { UserXIcon, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { attendanceApi, companyApi, departmentApi, sectionApi, designationApi, lineApi, groupApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }
interface Section { id: string; name: string }
interface Designation { id: string; name: string }
interface Line { id: string; name: string }
interface Group { id: string; name: string }

interface MissingRecord {
  badge_number: string
  employee_name: string
  employee_code?: string
  name_en?: string
  designation?: string
}

const today = new Date().toISOString().split("T")[0]

export default function MissingAttendancePage() {
  const [data, setData] = React.useState<MissingRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [lines, setLines] = React.useState<Line[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])
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
  ], [companies, departments, sections, designations, lines, groups])

  const fetchData = React.useCallback(async (params: Record<string, string>) => {
    setLoading(true)
    setError("")
    try {
      const active: Record<string, string> = {}
      if (params.date) active.date = params.date
      if (params.company_id) active.company_id = params.company_id
      if (params.department_id) active.department_id = params.department_id
      if (params.section_id) active.section_id = params.section_id
      if (params.designation_id) active.designation_id = params.designation_id
      if (params.line_id) active.line_id = params.line_id
      if (params.group_id) active.group_id = params.group_id
      const { data: res } = await attendanceApi.missing(active)
      setData(res?.missing || [])
    } catch {
      setError("Failed to load missing attendance data")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const init = async () => {
      const [cRes, dRes, secRes, desRes, lRes, gRes] = await Promise.all([
        companyApi.list(),
        departmentApi.list(),
        sectionApi.list(),
        designationApi.list(),
        lineApi.list(),
        groupApi.list(),
      ])
      if (Array.isArray(cRes.data)) setCompanies(cRes.data)
      if (Array.isArray(dRes.data)) setDepartments(dRes.data)
      if (Array.isArray(secRes.data)) setSections(secRes.data)
      if (Array.isArray(desRes.data)) setDesignations(desRes.data)
      if (Array.isArray(lRes.data)) setLines(lRes.data)
      if (Array.isArray(gRes.data)) setGroups(gRes.data)
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
          <UserXIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Missing Attendance</h1>
            <p className="text-muted-foreground mt-1">Employees with punch data but no attendance record</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10">Sl</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Badge No</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Employee Code</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Designation</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No missing attendance found.
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.badge_number} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{row.badge_number}</td>
                      <td className="px-3 py-2">{row.employee_code || "-"}</td>
                      <td className="px-3 py-2">{row.name_en || row.employee_name}</td>
                      <td className="px-3 py-2">{row.designation || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data.length > 0 && (
            <div className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Missing:</span>
              <Badge variant="destructive">{data.length}</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
