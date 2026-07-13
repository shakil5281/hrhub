"use client"

import { ReceiptIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const payslips = [
  { id: 1, employee: "Rafiqul Islam", month: "July 2026", basic: 25000, gross: 41500, deductions: 4150, netPay: 37350, status: "Generated" },
  { id: 2, employee: "Shamima Akter", month: "July 2026", basic: 30000, gross: 50000, deductions: 5000, netPay: 45000, status: "Generated" },
  { id: 3, employee: "Kamal Hossain", month: "July 2026", basic: 45000, gross: 75000, deductions: 7500, netPay: 67500, status: "Generated" },
  { id: 4, employee: "Nasrin Sultana", month: "July 2026", basic: 35000, gross: 58000, deductions: 5800, netPay: 52200, status: "Generated" },
  { id: 5, employee: "Jahangir Alam", month: "July 2026", basic: 22000, gross: 36700, deductions: 3670, netPay: 33030, status: "Pending" },
  { id: 6, employee: "Abdur Rahman", month: "July 2026", basic: 18000, gross: 29800, deductions: 2980, netPay: 26820, status: "Pending" },
  { id: 7, employee: "Maksuda Khatun", month: "July 2026", basic: 28000, gross: 46800, deductions: 4680, netPay: 42120, status: "Generated" },
  { id: 8, employee: "Shahidul Islam", month: "July 2026", basic: 20000, gross: 33500, deductions: 3350, netPay: 30150, status: "Pending" },
]

type Payslip = (typeof payslips)[number]

const columns: ColumnDef<Payslip>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "month", header: "Month" },
  { accessorKey: "basic", header: "Basic" },
  { accessorKey: "gross", header: "Gross" },
  { accessorKey: "deductions", header: "Deductions" },
  { accessorKey: "netPay", header: "Net Pay" },
  { accessorKey: "status", header: "Status" },
]

export default function PaySlipPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">PaySlip</h1>
        </div>
        <p className="text-muted-foreground mt-1">Employee payslip records</p>
      </div>
      <DataTable data={payslips} columns={columns} />
    </div>
  )
}
