"use client"

import * as React from "react"
import { UserXIcon, PlusIcon, RotateCcwIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Separation, separationTypeOptions, separationStatusOptions } from "@/components/data/separation-data"
import { separationApi, departmentApi, employeeApi } from "@/lib/api"
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
  { accessorKey: "type", header: "Separation Type" },
  { accessorKey: "date", header: "Separation Date" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        Approved: "default", Pending: "secondary", Rejected: "destructive", Processed: "outline",
      }
      return <Badge variant={map[row.original.status] || "secondary"}>{row.original.status}</Badge>
    },
  },
]

export default function SeperationPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Separation[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(true)
  const [processing, setProcessing] = React.useState(false)
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
      const { data: res } = await separationApi.list(params)
      setData(Array.isArray(res.data) ? res.data : [])
      setTotal(res.total ?? 0)
      setTotalPages(res.total_pages ?? 0)
    } catch {
      toast.error("Failed to load separations")
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

  const handleEdit = (s: Separation) => router.push(`/hr/seperation/${s.id}/edit`)
  const handleDelete = async (s: Separation) => {
    try {
      await separationApi.delete(s.id)
      toast.success("Separation deleted")
      fetchData(filters)
    } catch {
      toast.error("Failed to delete separation")
    }
  }

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const { data: res } = await separationApi.process(today)
      toast.success(res.message || "Separations processed")
      fetchData(filters)
    } catch {
      toast.error("Failed to process separations")
    } finally {
      setProcessing(false)
    }
  }

  const filterDefs: FilterDef[] = [
    { key: "employee", label: "Employee", type: "text", placeholder: "Filter by employee..." },
    { key: "employee_id", label: "Code", type: "text", placeholder: "Filter by code..." },
    { key: "department_id", label: "Department", type: "select", options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { key: "type", label: "Type", type: "select", options: separationTypeOptions.map((o) => ({ value: o.value, label: o.label })) },
    { key: "status", label: "Status", type: "select", options: [
      ...separationStatusOptions.map((o) => ({ value: o.value, label: o.label })),
      { value: "Processed", label: "Processed" },
    ] },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserXIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Separation</h1>
            <p className="text-muted-foreground mt-1">Manage employee separations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleProcess} disabled={processing} variant="outline">
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcwIcon className="mr-2 h-4 w-4" />}
            {processing ? "Processing..." : "Daily Process"}
          </Button>
          <Button onClick={() => router.push("/hr/seperation/create")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Separation
          </Button>
        </div>
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
