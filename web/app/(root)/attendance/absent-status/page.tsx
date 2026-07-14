"use client"

import * as React from "react"
import { UserXIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { attendanceApi } from "@/lib/api"

interface AbsentRecord {
  id: string
  employee_id: string
  date: string
  status: string
  employee?: {
    employee_code: string
    name_en: string
    designation: string
  }
}

export default function AbsentStatusPage() {
  const [data, setData] = React.useState<AbsentRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d
  })
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date())

  const fetchData = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    setError("")
    try {
      const params: Record<string, string> = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      }
      const { data: res } = await attendanceApi.absent(params)
      setData(res.attendances || [])
    } catch {
      setError("Failed to load absent data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <UserXIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Absent Status</h1>
            <p className="text-muted-foreground mt-1">Employees marked as absent</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <DatePicker value={startDate} onChange={setStartDate} className="w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <DatePicker value={endDate} onChange={setEndDate} className="w-40" />
            </div>
            <Button onClick={fetchData} disabled={loading || !startDate || !endDate}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10">Sl</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Employee Code</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Designation</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      No absent records found. Click &quot;Search&quot; to check.
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{format(new Date(row.date), "dd MMM yyyy")}</td>
                      <td className="px-3 py-2">{row.employee?.employee_code || "-"}</td>
                      <td className="px-3 py-2">{row.employee?.name_en || "-"}</td>
                      <td className="px-3 py-2">{row.employee?.designation || "-"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary" className="capitalize">{row.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data.length > 0 && (
            <div className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Absent:</span>
              <Badge variant="destructive">{data.length}</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
