"use client"

import { FileTextIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const leaveDetails = [
  { id: 1, employee: "Rafiqul Islam", type: "Annual Leave", total: 14, used: 5, remaining: 9, pending: 0 },
  { id: 2, employee: "Shamima Akter", type: "Annual Leave", total: 14, used: 3, remaining: 11, pending: 0 },
  { id: 3, employee: "Kamal Hossain", type: "Sick Leave", total: 10, used: 2, remaining: 8, pending: 1 },
  { id: 4, employee: "Nasrin Sultana", type: "Annual Leave", total: 14, used: 8, remaining: 6, pending: 0 },
  { id: 5, employee: "Jahangir Alam", type: "Casual Leave", total: 6, used: 4, remaining: 2, pending: 0 },
  { id: 6, employee: "Maksuda Khatun", type: "Sick Leave", total: 10, used: 1, remaining: 9, pending: 2 },
  { id: 7, employee: "Abdur Rahman", type: "Annual Leave", total: 14, used: 10, remaining: 4, pending: 5 },
  { id: 8, employee: "Shahidul Islam", type: "Casual Leave", total: 6, used: 2, remaining: 4, pending: 0 },
]

type LeaveDetail = (typeof leaveDetails)[number]

const columns: ColumnDef<LeaveDetail>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "type", header: "Leave Type" },
  { accessorKey: "total", header: "Total" },
  { accessorKey: "used", header: "Used" },
  { accessorKey: "remaining", header: "Remaining" },
  { accessorKey: "pending", header: "Pending" },
]

export default function LeaveDetailsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Leave Details</h1>
        </div>
        <p className="text-muted-foreground mt-1">Employee leave balance details</p>
      </div>
      <DataTable data={leaveDetails} columns={columns} />
    </div>
  )
}
