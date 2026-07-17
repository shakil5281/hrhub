"use client"

import * as React from "react"
import { FileTextIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { leaveBalanceApi, employeeApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

interface BalanceRecord {
  id: string
  employee_id: string
  leave_type: string
  year: number
  total: number
  used: number
  pending: number
  remaining: number
}

interface Employee { id: string; employee_id: string; name_en: string }

const thisYear = new Date().getFullYear()

const columns: ColumnDef<BalanceRecord>[] = [
  { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
  { accessorKey: "leave_type", header: "Leave Type" },
  { accessorKey: "total", header: "Total" },
  { accessorKey: "used", header: "Used" },
  { accessorKey: "pending", header: "Pending" },
  { accessorKey: "remaining", header: "Remaining" },
]

export default function LeaveDetailsPage() {
  const [data, setData] = React.useState<BalanceRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  const filterDefs: FilterDef[] = React.useMemo(() => [
    {
      key: "employee_id", label: "Employee", type: "select",
      options: employees.map((e) => ({ value: e.id, label: `${e.employee_id} - ${e.name_en}` })),
    },
  ], [employees])

  const fetchData = React.useCallback(async (params: Record<string, string>) => {
    setLoading(true)
    try {
      const active: Record<string, string> = { year: String(thisYear) }
      if (params.employee_id) active.employee_id = params.employee_id
      const { data: res } = await leaveBalanceApi.list(active)
      setData(Array.isArray(res) ? res.map((r: any, i: number) => ({ ...r, id: r.id || `${r.employee_id}-${r.leave_type}-${i}` })) : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    employeeApi.list().then((res) => {
      const list = res.data?.employees || res.data || []
      setEmployees(Array.isArray(list) ? list : [])
    }).catch(() => {})
    fetchData({})
  }, [])

  const handleChange = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const handleApply = () => {
    const active: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) if (v) active[k] = v
    fetchData(active)
  }

  const handleReset = () => {
    setFilters({})
    fetchData({})
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Leave Details</h1>
        </div>
        <p className="text-muted-foreground mt-1">Employee leave balance details</p>
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
