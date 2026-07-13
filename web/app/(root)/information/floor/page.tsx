"use client"

import { LayersIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const floors = [
  { id: 1, name: "Ground Floor", building: "Head Office", departments: "Reception, Cafeteria", rooms: 8, area: "5,000 sqft" },
  { id: 2, name: "1st Floor", building: "Head Office", departments: "Admin, HR", rooms: 12, area: "4,500 sqft" },
  { id: 3, name: "2nd Floor", building: "Head Office", departments: "Finance, Accounts", rooms: 10, area: "4,500 sqft" },
  { id: 4, name: "3rd Floor", building: "Head Office", departments: "IT, Design", rooms: 10, area: "4,500 sqft" },
  { id: 5, name: "4th Floor", building: "Head Office", departments: "Management", rooms: 6, area: "3,000 sqft" },
  { id: 6, name: "Ground Floor", building: "Factory 1", departments: "Production Floor", rooms: 4, area: "15,000 sqft" },
  { id: 7, name: "1st Floor", building: "Factory 1", departments: "Packaging, Storage", rooms: 6, area: "12,000 sqft" },
  { id: 8, name: "Mezzanine", building: "Factory 1", departments: "QC Lab", rooms: 3, area: "2,000 sqft" },
]

type Floor = (typeof floors)[number]

const columns: ColumnDef<Floor>[] = [
  { accessorKey: "name", header: "Floor Name" },
  { accessorKey: "building", header: "Building" },
  { accessorKey: "departments", header: "Departments" },
  { accessorKey: "rooms", header: "Rooms" },
  { accessorKey: "area", header: "Area" },
]

export default function FloorPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <LayersIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Floor</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage floors and locations</p>
      </div>
      <DataTable data={floors} columns={columns} />
    </div>
  )
}
