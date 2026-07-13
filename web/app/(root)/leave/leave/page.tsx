"use client"

import { CalendarCheckIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const leaves = [
  { id: 1, employee: "Rafiqul Islam", type: "Annual Leave", from: "2026-07-10", to: "2026-07-14", days: 5, reason: "Family vacation", status: "Approved" },
  { id: 2, employee: "Shamima Akter", type: "Sick Leave", from: "2026-07-12", to: "2026-07-13", days: 2, reason: "Fever", status: "Approved" },
  { id: 3, employee: "Kamal Hossain", type: "Casual Leave", from: "2026-07-15", to: "2026-07-15", days: 1, reason: "Personal work", status: "Pending" },
  { id: 4, employee: "Nasrin Sultana", type: "Annual Leave", from: "2026-07-20", to: "2026-07-25", days: 6, reason: "Vacation", status: "Approved" },
  { id: 5, employee: "Jahangir Alam", type: "Emergency Leave", from: "2026-07-18", to: "2026-07-18", days: 1, reason: "Urgent family matter", status: "Approved" },
  { id: 6, employee: "Maksuda Khatun", type: "Sick Leave", from: "2026-07-22", to: "2026-07-23", days: 2, reason: "Doctor appointment", status: "Pending" },
  { id: 7, employee: "Abdur Rahman", type: "Annual Leave", from: "2026-08-01", to: "2026-08-05", days: 5, reason: "Holiday", status: "Pending" },
  { id: 8, employee: "Shahidul Islam", type: "Casual Leave", from: "2026-07-25", to: "2026-07-25", days: 1, reason: "Personal", status: "Approved" },
]

type Leave = (typeof leaves)[number]

const columns: ColumnDef<Leave>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "type", header: "Leave Type" },
  { accessorKey: "from", header: "From" },
  { accessorKey: "to", header: "To" },
  { accessorKey: "days", header: "Days" },
  { accessorKey: "reason", header: "Reason" },
  { accessorKey: "status", header: "Status" },
]

export default function LeavePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <CalendarCheckIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Leave</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage employee leave applications</p>
      </div>
      <DataTable data={leaves} columns={columns} />
    </div>
  )
}
