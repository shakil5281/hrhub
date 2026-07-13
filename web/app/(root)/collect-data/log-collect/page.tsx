"use client"

import { DatabaseIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const logCollects = [
  { id: 1, device: "ZKTeco F18 (Main Gate)", date: "2026-07-13", records: 245, imported: 245, status: "Completed" },
  { id: 2, device: "ZKTeco F18 (Side Gate)", date: "2026-07-13", records: 180, imported: 180, status: "Completed" },
  { id: 3, device: "ZKTeco K14 (Office)", date: "2026-07-13", records: 65, imported: 65, status: "Completed" },
  { id: 4, device: "ZKTeco F18 (Main Gate)", date: "2026-07-12", records: 312, imported: 312, status: "Completed" },
  { id: 5, device: "ZKTeco F18 (Side Gate)", date: "2026-07-12", records: 198, imported: 198, status: "Completed" },
  { id: 6, device: "ZKTeco K14 (Office)", date: "2026-07-12", records: 72, imported: 70, status: "Partial" },
  { id: 7, device: "ZKTeco F18 (Main Gate)", date: "2026-07-11", records: 280, imported: 280, status: "Completed" },
  { id: 8, device: "ZKTeco F18 (Side Gate)", date: "2026-07-11", records: 165, imported: 0, status: "Pending" },
]

type LogCollect = (typeof logCollects)[number]

const columns: ColumnDef<LogCollect>[] = [
  { accessorKey: "device", header: "Device" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "records", header: "Total Records" },
  { accessorKey: "imported", header: "Imported" },
  { accessorKey: "status", header: "Status" },
]

export default function LogCollectPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Log Collect</h1>
        </div>
        <p className="text-muted-foreground mt-1">Collect attendance logs from devices</p>
      </div>
      <DataTable data={logCollects} columns={columns} />
    </div>
  )
}
