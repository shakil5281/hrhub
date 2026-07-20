"use client"

import * as React from "react"
import { SwordsIcon, PlusIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { punishmentApi, companyApi } from "@/lib/api"

interface Punishment {
  id: string
  employee_id: string
  type: string
  reason: string
  amount: number
  date: string
  status: string
  employee?: { name_en: string }
}

const typeOptions = [
  { value: "Warning", label: "Warning" },
  { value: "Fine", label: "Fine" },
  { value: "Suspension", label: "Suspension" },
  { value: "Termination", label: "Termination" },
]

const statusBadge = (status: string) => {
  const variant = status === "active" ? "default" : status === "inactive" ? "secondary" : "outline"
  return <Badge variant={variant} className="capitalize">{status}</Badge>
}

const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export default function PunishmentPage() {
  const [data, setData] = React.useState<Punishment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Punishment | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)

  const [form, setForm] = React.useState({ employee_id: "", type: "Warning", reason: "", amount: "", date: "" })

  const columns: ColumnDef<Punishment>[] = React.useMemo(() => [
    { accessorKey: "employee_id", header: "Employee ID" },
    {
      header: "Employee",
      accessorFn: (r) => r.employee?.name_en || "-",
    },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "reason", header: "Reason" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => row.original.amount ? `৳${row.original.amount}` : "-",
    },
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.status),
    },
  ], [])

  const fetchData = React.useCallback(async (p?: number, l?: number) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(p ?? page), limit: String(l ?? limit) }
      const { data: res } = await punishmentApi.list(params)
      setData(Array.isArray(res.data) ? res.data : [])
      setTotal(res.total ?? 0)
      setTotalPages(res.total_pages ?? 0)
    } catch {
      setData([])
      toast.error("Failed to load punishments")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  React.useEffect(() => { fetchData() }, [])
  React.useEffect(() => { fetchData() }, [page, limit])

  const resetForm = () => {
    setForm({ employee_id: "", type: "Warning", reason: "", amount: "", date: "" })
    setEditing(null)
  }

  const handleCreate = async () => {
    if (!form.employee_id || !form.date) { toast.error("Employee ID and date are required"); return }
    setSubmitting(true)
    try {
      await punishmentApi.create({
        employee_id: form.employee_id,
        type: form.type,
        reason: form.reason,
        amount: form.amount ? Number(form.amount) : 0,
        date: form.date,
      })
      toast.success("Punishment created")
      setDialogOpen(false)
      resetForm()
      fetchData(1)
    } catch { toast.error("Failed to create punishment") }
    finally { setSubmitting(false) }
  }

  const handleUpdate = async () => {
    if (!editing) return
    setSubmitting(true)
    try {
      await punishmentApi.update(editing.id, {
        employee_id: form.employee_id,
        type: form.type,
        reason: form.reason,
        amount: form.amount ? Number(form.amount) : 0,
        date: form.date,
      })
      toast.success("Punishment updated")
      setDialogOpen(false)
      resetForm()
      fetchData(page)
    } catch { toast.error("Failed to update punishment") }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (row: Punishment) => {
    try {
      await punishmentApi.delete(row.id)
      toast.success("Punishment deleted")
      fetchData(page)
    } catch { toast.error("Failed to delete punishment") }
  }

  const openEdit = (row: Punishment) => {
    setEditing(row)
    setForm({
      employee_id: row.employee_id,
      type: row.type,
      reason: row.reason || "",
      amount: String(row.amount ?? ""),
      date: row.date,
    })
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SwordsIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Punishment</h1>
            <p className="text-muted-foreground mt-1">Manage employee punishments</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Punishment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Punishment" : "Add Punishment"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <Label>Employee ID *</Label>
                <Input value={form.employee_id} onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))} placeholder="EMP-001" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type *</Label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={selectClass}>
                  {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Reason</Label>
                <Input value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Amount</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
              <Button onClick={editing ? handleUpdate : handleCreate} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        columns={columns}
        onEdit={openEdit}
        onDelete={handleDelete}
        serverSide={true}
        page={page}
        pageSize={limit}
        pageCount={totalPages}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        loading={loading}
      />
    </div>
  )
}
