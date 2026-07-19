"use client"

import * as React from "react"
import { CalendarCheckIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { leaveApi, companyApi, departmentApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LeaveRecord {
  id: string
  employee_id: string
  leave_type_id: string
  from_date: string
  to_date: string
  total_days: number
  reason: string
  status: string
  rejection_reason?: string
  employee?: { employee_id: string; name_en: string }
  leave_type?: { name: string }
}

interface Company { id: string; company_name_en: string }
interface Department { id: string; name: string }

const today = new Date().toISOString().split("T")[0]

const statusBadge = (status: string) => {
  const variant = status === "approved" ? "default" : status === "rejected" ? "destructive" : status === "cancelled" ? "secondary" : "outline"
  return <Badge variant={variant} className="capitalize">{status}</Badge>
}

export default function LeavePage() {
  const router = useRouter()
  const [data, setData] = React.useState<LeaveRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [filters, setFilters] = React.useState<Record<string, string>>({
    from_date: today,
    to_date: today,
  })
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
  const [rejectingId, setRejectingId] = React.useState<string | null>(null)
  const [rejectReason, setRejectReason] = React.useState("")

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)

  const filterDefs: FilterDef[] = React.useMemo(() => [
    { key: "from_date", label: "Start Date", type: "datepicker" },
    { key: "to_date", label: "End Date", type: "datepicker" },
    {
      key: "company_id", label: "Company", type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.company_name_en })),
    },
    {
      key: "department_id", label: "Department", type: "select",
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      key: "status", label: "Status", type: "select", options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    { key: "employee_id", label: "Employee ID", type: "text", placeholder: "Employee code..." },
  ], [companies, departments])

  const columns: ColumnDef<LeaveRecord>[] = React.useMemo(() => [
    { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
    { accessorKey: "employee.name_en", header: "Employee", cell: ({ row }) => row.original.employee?.name_en || "-" },
    { accessorKey: "leave_type.name", header: "Leave Type", cell: ({ row }) => row.original.leave_type?.name || "-" },
    { accessorKey: "from_date", header: "From" },
    { accessorKey: "to_date", header: "To" },
    { accessorKey: "total_days", header: "Days" },
    { accessorKey: "reason", header: "Reason" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.status !== "pending") return null
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="default"
              className="h-7 px-2 text-xs"
              onClick={() => handleApprove(row.original.id)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2 text-xs"
              onClick={() => { setRejectingId(row.original.id); setRejectReason(""); setRejectDialogOpen(true) }}
            >
              Reject
            </Button>
          </div>
        )
      },
    },
  ], [])

  const fetchData = React.useCallback(async (params: Record<string, string>, p?: number, l?: number) => {
    setLoading(true)
    try {
      const active: Record<string, string> = {}
      if (params.from_date) active.from_date = params.from_date
      if (params.to_date) active.to_date = params.to_date
      if (params.company_id) active.company_id = params.company_id
      if (params.department_id) active.department_id = params.department_id
      if (params.employee_id) active.employee_id = params.employee_id
      if (params.status) active.status = params.status
      active.page = String(p ?? page)
      active.limit = String(l ?? limit)
      const { data: res } = await leaveApi.list(active)
      setData(Array.isArray(res.data) ? res.data : [])
      setTotal(res.total ?? 0)
      setTotalPages(res.total_pages ?? 0)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  React.useEffect(() => {
    Promise.all([
      companyApi.list({ limit: "100" }),
      departmentApi.list({ limit: "100" }),
    ]).then(([cRes, dRes]) => {
      setCompanies(Array.isArray(cRes.data?.data) ? cRes.data.data : [])
      setDepartments(Array.isArray(dRes.data?.data) ? dRes.data.data : [])
    }).catch(() => {})
    fetchData({ from_date: today, to_date: today }, 1, 20)
  }, [])

  React.useEffect(() => {
    const active: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) if (v) active[k] = v
    fetchData(active)
  }, [page, limit])

  const handleChange = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }))

  const handleApply = () => {
    setPage(1)
    const active: Record<string, string> = {}
    for (const [k, v] of Object.entries(filters)) if (v) active[k] = v
    fetchData(active, 1)
  }

  const handleReset = () => {
    setPage(1)
    setLimit(20)
    setFilters({ from_date: today, to_date: today })
    fetchData({ from_date: today, to_date: today }, 1, 20)
  }

  const handleApprove = async (id: string) => {
    try {
      await leaveApi.approve(id)
      toast.success("Leave approved")
      fetchData(filters)
    } catch {
      toast.error("Failed to approve leave")
    }
  }

  const handleReject = async () => {
    if (!rejectingId) return
    try {
      await leaveApi.reject(rejectingId, rejectReason)
      toast.success("Leave rejected")
      setRejectDialogOpen(false)
      setRejectingId(null)
      setRejectReason("")
      fetchData(filters)
    } catch {
      toast.error("Failed to reject leave")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheckIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave</h1>
            <p className="text-muted-foreground mt-1">Manage employee leave applications</p>
          </div>
        </div>
        <Button onClick={() => router.push("/leave/leave-entry")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Leave Entry
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <FilterBar filters={filterDefs} values={filters} onChange={handleChange} onApply={handleApply} onReset={handleReset} submitting={loading} />
      </div>

      <DataTable
        data={data}
        columns={columns}
        serverSide={true}
        page={page}
        pageSize={limit}
        pageCount={totalPages}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
        loading={loading}
      />

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this leave application.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Rejection Reason *</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
