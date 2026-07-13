"use client"

import { UsersIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const groups = [
  { id: 1, name: "Production Team A", department: "Production", head: "Rafiqul Islam", employees: 25, shift: "Morning" },
  { id: 2, name: "Production Team B", department: "Production", head: "Shamima Akter", employees: 22, shift: "Evening" },
  { id: 3, name: "Office Staff", department: "Admin", head: "Kamal Hossain", employees: 15, shift: "Day" },
  { id: 4, name: "Security Team", department: "Security", head: "Abdur Rahman", employees: 18, shift: "Night" },
  { id: 5, name: "IT Department", department: "IT", head: "Nasrin Sultana", employees: 8, shift: "Flexible" },
  { id: 6, name: "Cleaning Crew", department: "Cleaning", head: "Farida Begum", employees: 12, shift: "Morning" },
  { id: 7, name: "Quality Control", department: "QC", head: "Jahangir Alam", employees: 10, shift: "Day" },
  { id: 8, name: "Logistics Team", department: "Logistics", head: "Maksuda Khatun", employees: 14, shift: "General" },
]

type Group = (typeof groups)[number]

const columns: ColumnDef<Group>[] = [
  { accessorKey: "name", header: "Group Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "head", header: "Head" },
  { accessorKey: "employees", header: "Employees" },
  { accessorKey: "shift", header: "Shift" },
]

export default function GroupPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Group</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manage employee groups and departments</p>
      </div>
      <DataTable data={groups} columns={columns} />
    </div>
  )
}
