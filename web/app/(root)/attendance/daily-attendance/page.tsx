"use client"

import * as React from "react"
import { ClipboardCheckIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { attendanceApi } from "@/lib/api"

interface AttendanceRecord {
  id: string
  employee_id: string
  company_id: string
  date: string
  check_in: string | null
  check_out: string | null
  total_hours: string | null
  status: string
  late_minutes: number
  employee?: { employee_code: string; designation: string }
}

const columns: ColumnDef<AttendanceRecord>[] = [
  { id: "sl", header: "Sl", cell: ({ row }) => row.index + 1 },
  {
    accessorKey: "employee_id",
    header: "Employee ID",
    cell: ({ row }) => row.original.employee?.employee_code || row.original.employee_id.slice(0, 8),
  },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "check_in", header: "Check In" },
  { accessorKey: "check_out", header: "Check Out" },
  { accessorKey: "total_hours", header: "Total Hours" },
  { accessorKey: "late_minutes", header: "Late (min)" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const variant = row.original.status === "present" ? "default" : row.original.status === "late" ? "destructive" : "secondary"
      return <Badge variant={variant} className="capitalize">{row.original.status}</Badge>
    },
  },
]

export default function DailyAttendancePage() {
  const [data, setData] = React.useState<AttendanceRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])

  const fetchAttendance = async () => {
    setLoading(true)
    setError("")
    try {
      const { data: res } = await attendanceApi.list({ date })
      setData(Array.isArray(res) ? res : [])
    } catch {
      setError("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAttendance()
  }, [date])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClipboardCheckIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
            <p className="text-muted-foreground mt-1">View and manage daily attendance records</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="px-4 lg:px-6 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  )
}
