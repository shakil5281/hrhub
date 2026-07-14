"use client"

import { FileSpreadsheetIcon } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const salarySheets = [
  { id: 1, employee: "Rafiqul Islam", code: "EMP001", basic: 25000, houseRent: 12500, medical: 2500, transport: 1500, gross: 41500, deductions: 4150, net: 37350 },
  { id: 2, employee: "Shamima Akter", code: "EMP002", basic: 30000, houseRent: 15000, medical: 3000, transport: 2000, gross: 50000, deductions: 5000, net: 45000 },
  { id: 3, employee: "Kamal Hossain", code: "EMP003", basic: 45000, houseRent: 22500, medical: 4500, transport: 3000, gross: 75000, deductions: 7500, net: 67500 },
  { id: 4, employee: "Nasrin Sultana", code: "EMP004", basic: 35000, houseRent: 17500, medical: 3500, transport: 2000, gross: 58000, deductions: 5800, net: 52200 },
  { id: 5, employee: "Jahangir Alam", code: "EMP005", basic: 22000, houseRent: 11000, medical: 2200, transport: 1500, gross: 36700, deductions: 3670, net: 33030 },
  { id: 6, employee: "Abdur Rahman", code: "EMP007", basic: 18000, houseRent: 9000, medical: 1800, transport: 1000, gross: 29800, deductions: 2980, net: 26820 },
  { id: 7, employee: "Maksuda Khatun", code: "EMP008", basic: 28000, houseRent: 14000, medical: 2800, transport: 2000, gross: 46800, deductions: 4680, net: 42120 },
  { id: 8, employee: "Shahidul Islam", code: "EMP009", basic: 20000, houseRent: 10000, medical: 2000, transport: 1500, gross: 33500, deductions: 3350, net: 30150 },
]

type SalarySheet = (typeof salarySheets)[number]

const columns: ColumnDef<SalarySheet>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "basic", header: "Basic" },
  { accessorKey: "houseRent", header: "House Rent" },
  { accessorKey: "medical", header: "Medical" },
  { accessorKey: "gross", header: "Gross" },
  { accessorKey: "deductions", header: "Deductions" },
  { accessorKey: "net", header: "Net Salary" },
]

export default function SalarySheetPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheetIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Salary Sheet</h1>
        </div>
        <p className="text-muted-foreground mt-1">Employee salary sheet details</p>
      </div>
      <DataTable data={salarySheets} columns={columns} />
    </div>
  )
}
