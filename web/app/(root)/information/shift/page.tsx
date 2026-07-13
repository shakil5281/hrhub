"use client"

import * as React from "react"
import { CalendarClockIcon, PlusIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shift, getShifts, createShift, updateShift, deleteShift, ShiftFormData } from "@/components/shift-data"
import { ShiftForm } from "@/components/shift-form"

const columns: ColumnDef<Shift>[] = [
  { accessorKey: "name", header: "Shift Name" },
  {
    accessorKey: "shiftType",
    header: "Shift Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.shiftType}</Badge>
    ),
  },
  { accessorKey: "inTime", header: "In Time" },
  { accessorKey: "outTime", header: "Out Time" },
  { accessorKey: "weekendDay", header: "Weekend Day" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
]

export default function ShiftPage() {
  const [shifts, setShifts] = React.useState<Shift[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingShift, setEditingShift] = React.useState<Shift | null>(null)

  React.useEffect(() => {
    setShifts(getShifts())
  }, [])

  const handleAdd = () => {
    setEditingShift(null)
    setDialogOpen(true)
  }

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift)
    setDialogOpen(true)
  }

  const handleDelete = (shift: Shift) => {
    deleteShift(shift.id)
    setShifts(getShifts())
  }

  const handleFormSuccess = (data: ShiftFormData) => {
    if (editingShift) {
      updateShift(editingShift.id, data)
    } else {
      createShift(data)
    }
    setShifts(getShifts())
    setDialogOpen(false)
    setEditingShift(null)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClockIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shift</h1>
            <p className="text-muted-foreground mt-1">Manage work shifts and schedules</p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>
      <DataTable
        key={shifts.length}
        data={shifts}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingShift ? "Edit Shift" : "Add New Shift"}</DialogTitle>
            <DialogDescription>
              {editingShift ? "Update the shift details below." : "Fill in the shift details below."}
            </DialogDescription>
          </DialogHeader>
          <ShiftForm
            initialData={editingShift ? {
              name: editingShift.name,
              shiftType: editingShift.shiftType,
              inTime: editingShift.inTime,
              outTime: editingShift.outTime,
              weekendDay: editingShift.weekendDay,
              status: editingShift.status,
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => { setDialogOpen(false); setEditingShift(null) }}
            isEditing={!!editingShift}
            shiftId={editingShift?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
