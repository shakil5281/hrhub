"use client"

import { ArrowUpDownIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const salaryProcesses = [
  { id: 1, month: "July 2026", department: "Production", employees: 48, grossSalary: 2400000, deductions: 120000, netSalary: 2280000, status: "Pending" },
  { id: 2, month: "July 2026", department: "Admin", employees: 14, grossSalary: 840000, deductions: 42000, netSalary: 798000, status: "Pending" },
  { id: 3, month: "July 2026", department: "Security", employees: 18, grossSalary: 540000, deductions: 27000, netSalary: 513000, status: "Processing" },
  { id: 4, month: "July 2026", department: "IT", employees: 8, grossSalary: 640000, deductions: 32000, netSalary: 608000, status: "Completed" },
  { id: 5, month: "July 2026", department: "QC", employees: 10, grossSalary: 400000, deductions: 20000, netSalary: 380000, status: "Pending" },
  { id: 6, month: "July 2026", department: "Cleaning", employees: 12, grossSalary: 240000, deductions: 12000, netSalary: 228000, status: "Completed" },
  { id: 7, month: "July 2026", department: "Logistics", employees: 14, grossSalary: 420000, deductions: 21000, netSalary: 399000, status: "Processing" },
  { id: 8, month: "July 2026", department: "Finance", employees: 10, grossSalary: 600000, deductions: 30000, netSalary: 570000, status: "Pending" },
]

type SalaryProcess = (typeof salaryProcesses)[number]

const columns: ColumnDef<SalaryProcess>[] = [
  { accessorKey: "month", header: "Month" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "employees", header: "Employees" },
  { accessorKey: "grossSalary", header: "Gross Salary" },
  { accessorKey: "deductions", header: "Deductions" },
  { accessorKey: "netSalary", header: "Net Salary" },
  { accessorKey: "status", header: "Status" },
]

export default function SalaryProcessPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ArrowUpDownIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Salary Process</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage salary processing</p>
      </div>
      <DataTable data={salaryProcesses} columns={columns} />
    </div>
  )
}
