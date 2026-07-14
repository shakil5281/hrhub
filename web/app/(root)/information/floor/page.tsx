"use client"

import * as React from "react"
import { LayersIcon, PlusIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Floor } from "@/components/data/floor-data"
import { FloorForm } from "@/components/form/floor-form"
import { floorApi } from "@/lib/api"

const columns: ColumnDef<Floor>[] = [
  { accessorKey: "name", header: "Floor Name" },
]

export default function FloorPage() {
  const [floors, setFloors] = React.useState<Floor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingFloor, setEditingFloor] = React.useState<Floor | null>(null)

  const fetchFloors = async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await floorApi.list()
      setFloors(Array.isArray(data) ? data : [])
    } catch {
      setError("Failed to load floors")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchFloors()
  }, [])

  const handleAdd = () => {
    setEditingFloor(null)
    setDialogOpen(true)
  }

  const handleEdit = (floor: Floor) => {
    setEditingFloor(floor)
    setDialogOpen(true)
  }

  const handleDelete = async (floor: Floor) => {
    try {
      await floorApi.delete(floor.id)
      setFloors((prev) => prev.filter((f) => f.id !== floor.id))
      toast.success("Floor deleted successfully")
    } catch {
      toast.error("Failed to delete floor")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayersIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Floor</h1>
            <p className="text-muted-foreground mt-1">Manage building floors</p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Floor
        </Button>
      </div>

      {error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="px-4 lg:px-6 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          key={floors.length}
          data={floors}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFloor ? "Edit Floor" : "Add New Floor"}</DialogTitle>
            <DialogDescription>
              {editingFloor ? "Update the floor name below." : "Fill in the floor details below."}
            </DialogDescription>
          </DialogHeader>
          <FloorForm
            initialData={editingFloor ? { name: editingFloor.name } : undefined}
            onSuccess={() => {
              setDialogOpen(false)
              setEditingFloor(null)
              fetchFloors()
            }}
            onCancel={() => { setDialogOpen(false); setEditingFloor(null) }}
            isEditing={!!editingFloor}
            floorId={editingFloor?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
