"use client"

import * as React from "react"
import { ClipboardListIcon, PlusIcon, SearchIcon, RotateCcwIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Requirement, getRequirements, deleteRequirement, departmentOptions, statusOptions, priorityOptions } from "@/components/requirement-data"

const columns: ColumnDef<Requirement>[] = [
  { accessorKey: "position", header: "Position" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "vacancies", header: "Vacancies" },
  { accessorKey: "applicants", header: "Applicants" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Open" ? "default" : "secondary"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const map: Record<string, "default" | "secondary" | "destructive"> = { High: "destructive", Medium: "default", Low: "secondary" }
      return <Badge variant={map[row.original.priority]}>{row.original.priority}</Badge>
    },
  },
]

export default function RequirementsPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Requirement[]>([])

  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [priorityFilter, setPriorityFilter] = React.useState("all")

  const loadData = React.useCallback(() => setData(getRequirements()), [])
  React.useEffect(loadData, [loadData])

  const filtered = React.useMemo(() => {
    let result = data
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.position.toLowerCase().includes(q) || e.department.toLowerCase().includes(q))
    }
    if (deptFilter !== "all") result = result.filter((e) => e.department === deptFilter)
    if (statusFilter !== "all") result = result.filter((e) => e.status === statusFilter)
    if (priorityFilter !== "all") result = result.filter((e) => e.priority === priorityFilter)
    return result
  }, [data, search, deptFilter, statusFilter, priorityFilter])

  const clearFilters = () => { setSearch(""); setDeptFilter("all"); setStatusFilter("all"); setPriorityFilter("all") }
  const hasFilters = search || deptFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all"

  const handleEdit = (req: Requirement) => router.push(`/hr/requirements/${req.id}/edit`)
  const handleDelete = (req: Requirement) => { deleteRequirement(req.id); loadData() }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requirements</h1>
            <p className="text-muted-foreground mt-1">Manage recruitment requirements</p>
          </div>
        </div>
        <Button onClick={() => router.push("/hr/requirements/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Requirement
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Position or department…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
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
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Statuses</option>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Priorities</option>
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
