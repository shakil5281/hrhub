"use client"

import * as React from "react"
import { TimerIcon, PlusIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TempShift, getTempShifts, createTempShift, updateTempShift, deleteTempShift, TempShiftFormData } from "@/components/temporary-shift-data"
import { TempShiftForm } from "@/components/temporary-shift-form"

const columns: ColumnDef<TempShift>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "employeeCode", header: "Code" },
  { accessorKey: "shift", header: "Assigned Shift" },
  { accessorKey: "fromDate", header: "From" },
  { accessorKey: "toDate", header: "To" },
  { accessorKey: "reason", header: "Reason" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const variant = status === "Approved" ? "default" : status === "Rejected" ? "destructive" : "secondary"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
]

export default function TemporaryShiftPage() {
  const [data, setData] = React.useState<TempShift[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<TempShift | null>(null)

  React.useEffect(() => { setData(getTempShifts()) }, [])

  const handleAdd = () => { setEditing(null); setDialogOpen(true) }
  const handleEdit = (item: TempShift) => { setEditing(item); setDialogOpen(true) }
  const handleDelete = (item: TempShift) => { deleteTempShift(item.id); setData(getTempShifts()) }
  const handleFormSuccess = (formData: TempShiftFormData) => {
    if (editing) updateTempShift(editing.id, formData)
    else createTempShift(formData)
    setData(getTempShifts())
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Temporary Shift</h1>
            <p className="text-muted-foreground mt-1">Manage temporary shift assignments</p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
      <DataTable key={data.length} data={data} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Temporary Shift" : "Add Temporary Shift"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the temporary shift details." : "Fill in the temporary shift details."}
            </DialogDescription>
          </DialogHeader>
          <TempShiftForm
            initialData={editing ? {
              employee: editing.employee,
              employeeCode: editing.employeeCode,
              shift: editing.shift,
              fromDate: editing.fromDate,
              toDate: editing.toDate,
              reason: editing.reason,
              status: editing.status,
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => { setDialogOpen(false); setEditing(null) }}
            isEditing={!!editing}
            tempShiftId={editing?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
