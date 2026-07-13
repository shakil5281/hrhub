"use client"

import { RefreshCwIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const dailyProcesses = [
  { id: 1, date: "2026-07-13", device: "ZKTeco F18 (Main Gate)", rawLogs: 245, processed: 240, errors: 5, status: "Completed" },
  { id: 2, date: "2026-07-13", device: "ZKTeco F18 (Side Gate)", rawLogs: 180, processed: 178, errors: 2, status: "Completed" },
  { id: 3, date: "2026-07-13", device: "ZKTeco K14 (Office)", rawLogs: 65, processed: 65, errors: 0, status: "Completed" },
  { id: 4, date: "2026-07-12", device: "ZKTeco F18 (Main Gate)", rawLogs: 312, processed: 310, errors: 2, status: "Completed" },
  { id: 5, date: "2026-07-12", device: "ZKTeco F18 (Side Gate)", rawLogs: 198, processed: 195, errors: 3, status: "Completed" },
  { id: 6, date: "2026-07-12", device: "ZKTeco K14 (Office)", rawLogs: 72, processed: 70, errors: 2, status: "Partial" },
  { id: 7, date: "2026-07-11", device: "ZKTeco F18 (Main Gate)", rawLogs: 280, processed: 0, errors: 0, status: "Pending" },
  { id: 8, date: "2026-07-11", device: "ZKTeco F18 (Side Gate)", rawLogs: 165, processed: 0, errors: 0, status: "Pending" },
]

type DailyProcess = (typeof dailyProcesses)[number]

const columns: ColumnDef<DailyProcess>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "device", header: "Device" },
  { accessorKey: "rawLogs", header: "Raw Logs" },
  { accessorKey: "processed", header: "Processed" },
  { accessorKey: "errors", header: "Errors" },
  { accessorKey: "status", header: "Status" },
]

export default function DailyProcessPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <RefreshCwIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Daily Process</h1>
        </div>
        <p className="text-muted-foreground mt-1">Process daily attendance data</p>
      </div>
      <DataTable data={dailyProcesses} columns={columns} />
    </div>
  )
}
