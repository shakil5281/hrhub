"use client"

import { TrendingUpIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const increments = [
  { id: 1, employee: "Rafiqul Islam", code: "EMP001", currentSalary: 37350, incrementAmount: 3000, newSalary: 40350, effectiveDate: "2026-08-01", status: "Approved" },
  { id: 2, employee: "Shamima Akter", code: "EMP002", currentSalary: 45000, incrementAmount: 4000, newSalary: 49000, effectiveDate: "2026-08-01", status: "Pending" },
  { id: 3, employee: "Jahangir Alam", code: "EMP005", currentSalary: 33030, incrementAmount: 2000, newSalary: 35030, effectiveDate: "2026-08-01", status: "Approved" },
  { id: 4, employee: "Abdur Rahman", code: "EMP007", currentSalary: 26820, incrementAmount: 1500, newSalary: 28320, effectiveDate: "2026-09-01", status: "Pending" },
  { id: 5, employee: "Maksuda Khatun", code: "EMP008", currentSalary: 42120, incrementAmount: 3500, newSalary: 45620, effectiveDate: "2026-08-01", status: "Approved" },
  { id: 6, employee: "Shahidul Islam", code: "EMP009", currentSalary: 30150, incrementAmount: 2500, newSalary: 32650, effectiveDate: "2026-09-01", status: "Pending" },
  { id: 7, employee: "Rokeya Begum", code: "EMP010", currentSalary: 38000, incrementAmount: 3000, newSalary: 41000, effectiveDate: "2026-08-01", status: "Approved" },
  { id: 8, employee: "Nasrin Sultana", code: "EMP004", currentSalary: 52200, incrementAmount: 5000, newSalary: 57200, effectiveDate: "2026-10-01", status: "Pending" },
]

type Increment = (typeof increments)[number]

const columns: ColumnDef<Increment>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "currentSalary", header: "Current Salary" },
  { accessorKey: "incrementAmount", header: "Increment" },
  { accessorKey: "newSalary", header: "New Salary" },
  { accessorKey: "effectiveDate", header: "Effective Date" },
  { accessorKey: "status", header: "Status" },
]

export default function IncrementPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Increment</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage salary increments</p>
      </div>
      <DataTable data={increments} columns={columns} />
    </div>
  )
}
