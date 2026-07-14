"use client"

import * as React from "react"
import { UserXIcon, PlusIcon, SearchIcon, RotateCcwIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Separation, getSeparations, deleteSeparation, departmentOptions, separationTypeOptions, separationStatusOptions } from "@/components/data/separation-data"

const columns: ColumnDef<Separation>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "employeeCode", header: "Code" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "date", header: "Date" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const map: Record<string, "default" | "secondary" | "destructive"> = { Approved: "default", Pending: "secondary", Rejected: "destructive" }
      return <Badge variant={map[row.original.status]}>{row.original.status}</Badge>
    },
  },
]

export default function SeperationPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Separation[]>([])

  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const loadData = React.useCallback(() => setData(getSeparations()), [])
  React.useEffect(loadData, [loadData])

  const filtered = React.useMemo(() => {
    let result = data
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) => s.employee.toLowerCase().includes(q) || s.employeeCode.toLowerCase().includes(q))
    }
    if (deptFilter !== "all") result = result.filter((s) => s.department === deptFilter)
    if (typeFilter !== "all") result = result.filter((s) => s.type === typeFilter)
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter)
    return result
  }, [data, search, deptFilter, typeFilter, statusFilter])

  const clearFilters = () => { setSearch(""); setDeptFilter("all"); setTypeFilter("all"); setStatusFilter("all") }
  const hasFilters = search || deptFilter !== "all" || typeFilter !== "all" || statusFilter !== "all"

  const handleEdit = (s: Separation) => router.push(`/hr/seperation/${s.id}/edit`)
  const handleDelete = (s: Separation) => { deleteSeparation(s.id); loadData() }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserXIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seperation</h1>
            <p className="text-muted-foreground mt-1">Manage employee separations</p>
          </div>
        </div>
        <Button onClick={() => router.push("/hr/seperation/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Separation
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Employee or code…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
              </div>
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
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Types</option>
                {separationTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Statuses</option>
                {separationStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcwIcon className="mr-1 size-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <DataTable key={filtered.length} data={filtered} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
