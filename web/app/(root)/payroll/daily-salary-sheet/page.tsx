"use client"

import { CalendarRangeIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const dailySalaries = [
  { id: 1, employee: "Rafiqul Islam", code: "EMP001", date: "2026-07-13", present: "Yes", dailyRate: 1380, overtime: 345, total: 1725 },
  { id: 2, employee: "Shamima Akter", code: "EMP002", date: "2026-07-13", present: "Yes", dailyRate: 1667, overtime: 0, total: 1667 },
  { id: 3, employee: "Kamal Hossain", code: "EMP003", date: "2026-07-13", present: "Yes", dailyRate: 2500, overtime: 375, total: 2875 },
  { id: 4, employee: "Jahangir Alam", code: "EMP005", date: "2026-07-13", present: "Yes", dailyRate: 1223, overtime: 183, total: 1406 },
  { id: 5, employee: "Farida Begum", code: "EMP006", date: "2026-07-13", present: "No", dailyRate: 800, overtime: 0, total: 0 },
  { id: 6, employee: "Abdur Rahman", code: "EMP007", date: "2026-07-13", present: "Yes", dailyRate: 993, overtime: 248, total: 1241 },
  { id: 7, employee: "Maksuda Khatun", code: "EMP008", date: "2026-07-13", present: "Yes", dailyRate: 1560, overtime: 0, total: 1560 },
  { id: 8, employee: "Shahidul Islam", code: "EMP009", date: "2026-07-13", present: "Yes", dailyRate: 1117, overtime: 168, total: 1285 },
]

type DailySalary = (typeof dailySalaries)[number]

const columns: ColumnDef<DailySalary>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "present", header: "Present" },
  { accessorKey: "dailyRate", header: "Daily Rate" },
  { accessorKey: "overtime", header: "Overtime" },
  { accessorKey: "total", header: "Total" },
]

export default function DailySalarySheetPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <CalendarRangeIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Daily Salary Sheet</h1>
        </div>
        <p className="text-muted-foreground mt-1">Daily salary calculation sheet</p>
      </div>
      <DataTable data={dailySalaries} columns={columns} />
    </div>
  )
}
