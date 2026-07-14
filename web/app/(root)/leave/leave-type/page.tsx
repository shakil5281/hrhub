"use client"

import { TagIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const leaveTypes = [
  { id: 1, name: "Annual Leave", code: "AL", days: 14, carryForward: 5, gender: "All", status: "Active" },
  { id: 2, name: "Sick Leave", code: "SL", days: 10, carryForward: 0, gender: "All", status: "Active" },
  { id: 3, name: "Casual Leave", code: "CL", days: 6, carryForward: 0, gender: "All", status: "Active" },
  { id: 4, name: "Maternity Leave", code: "ML", days: 120, carryForward: 0, gender: "Female", status: "Active" },
  { id: 5, name: "Paternity Leave", code: "PL", days: 5, carryForward: 0, gender: "Male", status: "Active" },
  { id: 6, name: "Emergency Leave", code: "EL", days: 3, carryForward: 0, gender: "All", status: "Active" },
  { id: 7, name: "Study Leave", code: "STL", days: 30, carryForward: 0, gender: "All", status: "Inactive" },
  { id: 8, name: "Hajj Leave", code: "HL", days: 40, carryForward: 0, gender: "All", status: "Active" },
]

type LeaveType = (typeof leaveTypes)[number]

const columns: ColumnDef<LeaveType>[] = [
  { accessorKey: "name", header: "Leave Type" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "days", header: "Allowed Days" },
  { accessorKey: "carryForward", header: "Carry Forward" },
  { accessorKey: "gender", header: "Applicable Gender" },
  { accessorKey: "status", header: "Status" },
]

export default function LeaveTypePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <TagIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Leave Type</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage leave types and policies</p>
      </div>
      <DataTable data={leaveTypes} columns={columns} />
    </div>
  )
}
