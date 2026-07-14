"use client"

import { ChartColumnIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const overtimeSummary = [
  { id: 1, department: "Production", employees: 42, totalOtHours: 95.5, avgOtPerPerson: 2.27, maxOt: 5.0, month: "July 2026" },
  { id: 2, department: "Admin", employees: 14, totalOtHours: 18.0, avgOtPerPerson: 1.29, maxOt: 2.5, month: "July 2026" },
  { id: 3, department: "Security", employees: 18, totalOtHours: 52.0, avgOtPerPerson: 2.89, maxOt: 4.0, month: "July 2026" },
  { id: 4, department: "IT", employees: 8, totalOtHours: 20.5, avgOtPerPerson: 2.56, maxOt: 3.5, month: "July 2026" },
  { id: 5, department: "QC", employees: 10, totalOtHours: 28.0, avgOtPerPerson: 2.80, maxOt: 4.0, month: "July 2026" },
  { id: 6, department: "Cleaning", employees: 12, totalOtHours: 15.0, avgOtPerPerson: 1.25, maxOt: 2.0, month: "July 2026" },
  { id: 7, department: "Logistics", employees: 14, totalOtHours: 35.0, avgOtPerPerson: 2.50, maxOt: 4.5, month: "July 2026" },
  { id: 8, department: "Finance", employees: 10, totalOtHours: 12.0, avgOtPerPerson: 1.20, maxOt: 2.0, month: "July 2026" },
]

type OvertimeSummary = (typeof overtimeSummary)[number]

const columns: ColumnDef<OvertimeSummary>[] = [
  { accessorKey: "department", header: "Department" },
  { accessorKey: "employees", header: "Employees" },
  { accessorKey: "totalOtHours", header: "Total OT Hours" },
  { accessorKey: "avgOtPerPerson", header: "Avg OT/Person" },
  { accessorKey: "maxOt", header: "Max OT" },
  { accessorKey: "month", header: "Month" },
]

export default function OverTimeSummaryPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ChartColumnIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Over Time Summary</h1>
        </div>
        <p className="text-muted-foreground mt-1">Overtime summary and reports</p>
      </div>
      <DataTable data={overtimeSummary} columns={columns} />
    </div>
  )
}
