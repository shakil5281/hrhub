"use client"

import { ChartColumnIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const monthlyReports = [
  { id: 1, month: "January 2026", department: "Production", totalLeaves: 12, approved: 10, rejected: 2, pending: 0 },
  { id: 2, month: "January 2026", department: "Admin", totalLeaves: 4, approved: 3, rejected: 1, pending: 0 },
  { id: 3, month: "February 2026", department: "Production", totalLeaves: 8, approved: 7, rejected: 0, pending: 1 },
  { id: 4, month: "February 2026", department: "Security", totalLeaves: 5, approved: 4, rejected: 1, pending: 0 },
  { id: 5, month: "March 2026", department: "Production", totalLeaves: 15, approved: 12, rejected: 2, pending: 1 },
  { id: 6, month: "March 2026", department: "IT", totalLeaves: 3, approved: 3, rejected: 0, pending: 0 },
  { id: 7, month: "April 2026", department: "Production", totalLeaves: 10, approved: 9, rejected: 1, pending: 0 },
  { id: 8, month: "April 2026", department: "Finance", totalLeaves: 2, approved: 2, rejected: 0, pending: 0 },
]

type MonthlyReport = (typeof monthlyReports)[number]

const columns: ColumnDef<MonthlyReport>[] = [
  { accessorKey: "month", header: "Month" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "totalLeaves", header: "Total Leaves" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "rejected", header: "Rejected" },
  { accessorKey: "pending", header: "Pending" },
]

export default function MonthlyLeaveReportPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ChartColumnIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Monthly Leave Report</h1>
        </div>
        <p className="text-muted-foreground mt-1">Monthly leave reports by department</p>
      </div>
      <DataTable data={monthlyReports} columns={columns} />
    </div>
  )
}
