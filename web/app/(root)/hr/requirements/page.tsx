"use client"

import * as React from "react"
import { ClipboardListIcon, PlusIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Requirement, statusOptions, priorityOptions } from "@/components/data/requirement-data"
import { requirementApi, departmentApi } from "@/lib/api"
import type { Department } from "@/components/data/organization-data"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

const columns: ColumnDef<Requirement>[] = [
  { accessorKey: "position", header: "Position" },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <span>{row.original.department?.name || row.original.department_id}</span>,
  },
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
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)

  const fetchData = React.useCallback(async (f?: Record<string, string>, p?: number, l?: number) => {
    setLoading(true)
    try {
      const params = { ...(f || {}), page: String(p ?? page), limit: String(l ?? limit) }
      const { data: res } = await requirementApi.list(params)
      setData(Array.isArray(res.data) ? res.data : [])
      setTotal(res.total ?? 0)
      setTotalPages(res.total_pages ?? 0)
    } catch {
      toast.error("Failed to load requirements")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  React.useEffect(() => {
    departmentApi.list({ limit: "100" }).then((res) => {
      setDepartments(Array.isArray(res.data?.data) ? res.data.data : [])
    }).catch(() => {})
    fetchData()
  }, [])

  React.useEffect(() => {
    fetchData(filters)
  }, [page, limit])

  const handleApply = async () => {
    setPage(1)
    const active: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) {
      if (v) active[k] = v
    }
    setSubmitting(true)
    await fetchData(active, 1)
    setSubmitting(false)
  }

  const handleReset = () => {
    setPage(1)
    setLimit(20)
    setFilters({})
    fetchData({}, 1, 20)
  }

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleEdit = (req: Requirement) => router.push(`/hr/requirements/${req.id}/edit`)
  const handleDelete = async (req: Requirement) => {
    try {
      await requirementApi.delete(req.id)
      toast.success("Requirement deleted")
      fetchData(filters)
    } catch {
      toast.error("Failed to delete requirement")
    }
  }

  const filterDefs: FilterDef[] = [
    { key: "position", label: "Position", type: "text", placeholder: "Filter by position..." },
    { key: "department_id", label: "Department", type: "select", options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { key: "status", label: "Status", type: "select", options: statusOptions.map((o) => ({ value: o.value, label: o.label })) },
    { key: "priority", label: "Priority", type: "select", options: priorityOptions.map((o) => ({ value: o.value, label: o.label })) },
  ]

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
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={handleChange}
          onApply={handleApply}
          onReset={handleReset}
          submitting={submitting}
        />
      </div>

      <DataTable
        data={data}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        serverSide={true}
        page={page}
        pageSize={limit}
        pageCount={totalPages}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
        loading={loading}
      />
    </div>
  )
}
