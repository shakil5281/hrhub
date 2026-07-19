"use client"

import * as React from "react"
import { IdCardIcon, PlusIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { IdCard, idCardStatusOptions } from "@/components/data/id-card-data"
import { idCardApi, departmentApi, designationApi } from "@/lib/api"
import type { Department } from "@/components/data/organization-data"
import type { Designation } from "@/components/data/organization-data"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

const columns: ColumnDef<IdCard>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "employee_id", header: "Emp. ID" },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => <span>{row.original.designation?.name || row.original.designation_id}</span>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <span>{row.original.department?.name || row.original.department_id}</span>,
  },
  { accessorKey: "card_no", header: "Card No" },
  { accessorKey: "issued", header: "Issued" },
  { accessorKey: "expiry", header: "Expiry" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const map: Record<string, "default" | "secondary" | "destructive"> = { Active: "default", Expired: "secondary", Lost: "destructive", Damaged: "destructive" }
      return <Badge variant={map[row.original.status]}>{row.original.status}</Badge>
    },
  },
]

export default function IdCardPage() {
  const router = useRouter()
  const [data, setData] = React.useState<IdCard[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
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
      const { data: res } = await idCardApi.list(params)
      setData(Array.isArray(res.data) ? res.data : [])
      setTotal(res.total ?? 0)
      setTotalPages(res.total_pages ?? 0)
    } catch {
      toast.error("Failed to load ID cards")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  React.useEffect(() => {
    Promise.all([
      departmentApi.list({ limit: "100" }),
      designationApi.list(undefined, { limit: "100" }),
    ]).then(([deptRes, desigRes]) => {
      setDepartments(Array.isArray(deptRes.data?.data) ? deptRes.data.data : [])
      setDesignations(Array.isArray(desigRes.data?.data) ? desigRes.data.data : [])
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

  const handleEdit = (c: IdCard) => router.push(`/hr/id-card/${c.id}/edit`)
  const handleDelete = async (c: IdCard) => {
    try {
      await idCardApi.delete(c.id)
      toast.success("ID card deleted")
      fetchData(filters)
    } catch {
      toast.error("Failed to delete ID card")
    }
  }

  const filterDefs: FilterDef[] = [
    { key: "employee", label: "Employee", type: "text", placeholder: "Filter by employee..." },
    { key: "employee_id", label: "Code", type: "text", placeholder: "Filter by code..." },
    { key: "card_no", label: "Card No", type: "text", placeholder: "Filter by card no..." },
    { key: "department_id", label: "Department", type: "select", options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { key: "designation_id", label: "Designation", type: "select", options: designations.map((d) => ({ value: d.id, label: d.name })) },
    { key: "status", label: "Status", type: "select", options: idCardStatusOptions.map((o) => ({ value: o.value, label: o.label })) },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IdCardIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ID Card</h1>
            <p className="text-muted-foreground mt-1">Manage employee ID cards</p>
          </div>
        </div>
        <Button onClick={() => router.push("/hr/id-card/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add ID Card
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
