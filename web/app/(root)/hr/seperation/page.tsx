"use client"

import * as React from "react"
import { UserXIcon, PlusIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Separation, separationTypeOptions, separationStatusOptions } from "@/components/data/separation-data"
import { separationApi, departmentApi } from "@/lib/api"
import type { Department } from "@/components/data/organization-data"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

const columns: ColumnDef<Separation>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "employee_id", header: "Emp. ID" },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <span>{row.original.department?.name || row.original.department_id}</span>,
  },
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
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const fetchData = React.useCallback(async (f?: Record<string, string>) => {
    setLoading(true)
    try {
      const [sepRes, deptRes] = await Promise.all([
        separationApi.list(f),
        departmentApi.list(),
      ])
      setData(Array.isArray(sepRes.data) ? sepRes.data : [])
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : [])
    } catch {
      toast.error("Failed to load separations")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  const handleApply = async () => {
    const active: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) {
      if (v) active[k] = v
    }
    setSubmitting(true)
    await fetchData(active)
    setSubmitting(false)
  }

  const handleReset = () => {
    setFilters({})
    fetchData()
  }

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleEdit = (s: Separation) => router.push(`/hr/seperation/${s.id}/edit`)
  const handleDelete = async (s: Separation) => {
    try {
      await separationApi.delete(s.id)
      toast.success("Separation deleted")
      fetchData()
    } catch {
      toast.error("Failed to delete separation")
    }
  }

  const filterDefs: FilterDef[] = [
    { key: "employee", label: "Employee", type: "text", placeholder: "Filter by employee..." },
    { key: "employee_id", label: "Code", type: "text", placeholder: "Filter by code..." },
    { key: "department_id", label: "Department", type: "select", options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { key: "type", label: "Type", type: "select", options: separationTypeOptions.map((o) => ({ value: o.value, label: o.label })) },
    { key: "status", label: "Status", type: "select", options: separationStatusOptions.map((o) => ({ value: o.value, label: o.label })) },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

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
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={handleChange}
          onApply={handleApply}
          onReset={handleReset}
          submitting={submitting}
        />
      </div>

      <DataTable data={data} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
