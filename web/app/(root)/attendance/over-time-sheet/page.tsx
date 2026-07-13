"use client"

import { ClockIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const overtimeSheets = [
  { id: 1, employee: "Rafiqul Islam", date: "2026-07-13", shift: "Morning", otHours: 2.5, reason: "Production target", status: "Approved" },
  { id: 2, employee: "Shamima Akter", date: "2026-07-13", shift: "Evening", otHours: 3.0, reason: "Inventory check", status: "Pending" },
  { id: 3, employee: "Kamal Hossain", date: "2026-07-14", shift: "Day", otHours: 1.5, reason: "Report submission", status: "Approved" },
  { id: 4, employee: "Jahangir Alam", date: "2026-07-14", shift: "Day", otHours: 4.0, reason: "QC audit", status: "Pending" },
  { id: 5, employee: "Nasrin Sultana", date: "2026-07-15", shift: "Flexible", otHours: 2.0, reason: "Server maintenance", status: "Approved" },
  { id: 6, employee: "Abdur Rahman", date: "2026-07-15", shift: "Night", otHours: 3.5, reason: "Extra patrol", status: "Approved" },
  { id: 7, employee: "Maksuda Khatun", date: "2026-07-16", shift: "Day", otHours: 1.0, reason: "Month end closing", status: "Pending" },
  { id: 8, employee: "Farida Begum", date: "2026-07-16", shift: "Morning", otHours: 2.0, reason: "Deep cleaning", status: "Rejected" },
]

type OvertimeSheet = (typeof overtimeSheets)[number]

const columns: ColumnDef<OvertimeSheet>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "shift", header: "Shift" },
  { accessorKey: "otHours", header: "OT Hours" },
  { accessorKey: "reason", header: "Reason" },
  { accessorKey: "status", header: "Status" },
]

export default function OverTimeSheetPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Over Time Sheet</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage overtime records and sheets</p>
      </div>
      <DataTable data={overtimeSheets} columns={columns} />
    </div>
  )
}
