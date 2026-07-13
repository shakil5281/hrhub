"use client"

import { FileBarChartIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const salarySummaries = [
  { id: 1, department: "Production", employees: 48, basic: 1050000, houseRent: 525000, medical: 105000, transport: 72000, total: 1752000, deductions: 175200, netTotal: 1576800 },
  { id: 2, department: "Admin", employees: 14, basic: 420000, houseRent: 210000, medical: 42000, transport: 28000, total: 700000, deductions: 70000, netTotal: 630000 },
  { id: 3, department: "Security", employees: 18, basic: 324000, houseRent: 162000, medical: 32400, transport: 18000, total: 536400, deductions: 53640, netTotal: 482760 },
  { id: 4, department: "IT", employees: 8, basic: 280000, houseRent: 140000, medical: 28000, transport: 16000, total: 464000, deductions: 46400, netTotal: 417600 },
  { id: 5, department: "QC", employees: 10, basic: 220000, houseRent: 110000, medical: 22000, transport: 15000, total: 367000, deductions: 36700, netTotal: 330300 },
  { id: 6, department: "Cleaning", employees: 12, basic: 144000, houseRent: 72000, medical: 14400, transport: 12000, total: 242400, deductions: 24240, netTotal: 218160 },
  { id: 7, department: "Logistics", employees: 14, basic: 252000, houseRent: 126000, medical: 25200, transport: 14000, total: 417200, deductions: 41720, netTotal: 375480 },
  { id: 8, department: "Finance", employees: 10, basic: 280000, houseRent: 140000, medical: 28000, transport: 20000, total: 468000, deductions: 46800, netTotal: 421200 },
]

type SalarySummary = (typeof salarySummaries)[number]

const columns: ColumnDef<SalarySummary>[] = [
  { accessorKey: "department", header: "Department" },
  { accessorKey: "employees", header: "Employees" },
  { accessorKey: "basic", header: "Basic Total" },
  { accessorKey: "houseRent", header: "House Rent" },
  { accessorKey: "total", header: "Gross Total" },
  { accessorKey: "deductions", header: "Deductions" },
  { accessorKey: "netTotal", header: "Net Total" },
]

export default function SalarySummaryPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <FileBarChartIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Salary Summary</h1>
        </div>
        <p className="text-muted-foreground mt-1">Salary summary by department</p>
      </div>
      <DataTable data={salarySummaries} columns={columns} />
    </div>
  )
}
