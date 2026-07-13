"use client"

import { MapPinIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const addresses = [
  { id: 1, name: "Head Office", address: "123 Gulshan Avenue, Dhaka", city: "Dhaka", type: "Corporate", status: "Active" },
  { id: 2, name: "Factory 1", address: "Kawran Bazar, Dhaka", city: "Dhaka", type: "Factory", status: "Active" },
  { id: 3, name: "Factory 2", address: "Kamlapur, Narayanganj", city: "Narayanganj", type: "Factory", status: "Active" },
  { id: 4, name: "Warehouse", address: "Kadamtali, Chattogram", city: "Chattogram", type: "Warehouse", status: "Active" },
  { id: 5, name: "Branch Office", address: "2 No. Gate, Chattogram", city: "Chattogram", type: "Branch", status: "Active" },
  { id: 6, name: "Regional Office", address: "Rangpur Sadar, Rangpur", city: "Rangpur", type: "Regional", status: "Inactive" },
  { id: 7, name: "Showroom", address: "Gulistan, Dhaka", city: "Dhaka", type: "Showroom", status: "Active" },
  { id: 8, name: "Training Center", address: "Savar, Dhaka", city: "Dhaka", type: "Training", status: "Active" },
]

type Address = (typeof addresses)[number]

const columns: ColumnDef<Address>[] = [
  { accessorKey: "name", header: "Location Name" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "status", header: "Status" },
]

export default function AddressPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Address</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage company addresses and locations</p>
      </div>
      <DataTable data={addresses} columns={columns} />
    </div>
  )
}
