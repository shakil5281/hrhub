"use client"

import * as React from "react"
import { ChartColumnIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { leaveReportApi, companyApi, departmentApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

interface ReportRecord {
  id: string
  department_name: string
  total: number
  approved: number
  rejected: number
  pending: number
}

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }

const now = new Date()
const thisMonth = now.getMonth() + 1
const thisYear = now.getFullYear()

const columns: ColumnDef<ReportRecord>[] = [
  { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
  { accessorKey: "department_name", header: "Department" },
  { accessorKey: "total", header: "Total Leaves" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "rejected", header: "Rejected" },
  { accessorKey: "pending", header: "Pending" },
]

export default function MonthlyLeaveReportPage() {
  const [data, setData] = React.useState<ReportRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [filters, setFilters] = React.useState<Record<string, string>>({
    month: String(thisMonth),
    year: String(thisYear),
  })

  const filterDefs: FilterDef[] = React.useMemo(() => [
    {
      key: "company_id", label: "Company", type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.company_name_en })),
    },
    {
      key: "department_id", label: "Department", type: "select",
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
  ], [companies, departments])

  const fetchData = React.useCallback(async (params: Record<string, string>) => {
    setLoading(true)
    try {
      const active: Record<string, string> = {
        month: params.month || String(thisMonth),
        year: params.year || String(thisYear),
      }
      if (params.company_id) active.company_id = params.company_id
      if (params.department_id) active.department_id = params.department_id
      const { data: res } = await leaveReportApi.monthly(active)
      setData(Array.isArray(res) ? res.map((r: any, i: number) => ({ ...r, id: r.id || r.department_id || String(i) })) : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    Promise.all([
      companyApi.list(),
      departmentApi.list(),
    ]).then(([cRes, dRes]) => {
      setCompanies(Array.isArray(cRes.data) ? cRes.data : [])
      setDepartments(Array.isArray(dRes.data) ? dRes.data : [])
    }).catch(() => {})
    fetchData({ month: String(thisMonth), year: String(thisYear) })
  }, [])

  const handleChange = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const handleApply = () => {
    const active: Record<string, string> = { month: String(thisMonth), year: String(thisYear) }
    for (const [k, v] of Object.entries(filters)) if (v) active[k] = v
    fetchData(active)
  }

  const handleReset = () => {
    setFilters({ month: String(thisMonth), year: String(thisYear) })
    fetchData({ month: String(thisMonth), year: String(thisYear) })
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ChartColumnIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Monthly Leave Report</h1>
        </div>
        <p className="text-muted-foreground mt-1">Monthly leave reports by department</p>
      </div>
      <div className="px-4 lg:px-6">
        <FilterBar filters={filterDefs} values={filters} onChange={handleChange} onApply={handleApply} onReset={handleReset} submitting={loading} />
      </div>
      {loading ? (
        <div className="px-4 lg:px-6 flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  )
}
