"use client"

import * as React from "react"
import { ClipboardListIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { attendanceApi } from "@/lib/api"

interface JobCardRecord {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  total_hours: string | null
  status: string
  late_minutes: number
  employee?: {
    employee_code: string
    name_en: string
    designation: string
    phone: string
    joining_date: string
    company?: { company_name_en: string }
  }
}

export default function JobCardPage() {
  const [data, setData] = React.useState<JobCardRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [employeeId, setEmployeeId] = React.useState("")
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  })
  const [endDate, setEndDate] = React.useState<Date | undefined>(() => new Date())

  const fetchJobCard = async () => {
    setLoading(true)
    setError("")
    try {
      const params: Record<string, string> = {}
      if (employeeId) params.employee_id = employeeId
      if (startDate) params.start_date = format(startDate, "yyyy-MM-dd")
      if (endDate) params.end_date = format(endDate, "yyyy-MM-dd")
      const { data: res } = await attendanceApi.jobCard(params)
      setData(res.attendances || [])
    } catch {
      setError("Failed to load job card data")
    } finally {
      setLoading(false)
    }
  }

  const emp = data.length > 0 ? data[0].employee : null
  const totalPresent = data.filter((r) => r.status === "present").length
  const totalLate = data.filter((r) => r.status === "late").length
  const totalAbsent = data.filter((r) => r.status === "absent").length
  const totalLateMinutes = data.reduce((sum, r) => sum + (r.late_minutes || 0), 0)

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Card</h1>
            <p className="text-muted-foreground mt-1">Employee attendance job card report</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
              <Input
                placeholder="Employee code"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <DatePicker value={startDate} onChange={setStartDate} placeholder="Start date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <DatePicker value={endDate} onChange={setEndDate} placeholder="End date" />
            </div>
            <Button onClick={fetchJobCard} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          {/* Header: Employee Info */}
          {emp && (
            <div className="border-b bg-muted/30 px-4 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{emp.name_en}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Code: </span>
                  <span className="font-medium">{emp.employee_code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Designation: </span>
                  <span className="font-medium">{emp.designation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Company: </span>
                  <span className="font-medium">{emp.company?.company_name_en || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">{emp.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Joining: </span>
                  <span className="font-medium">{emp.joining_date ? format(new Date(emp.joining_date), "dd MMM yyyy") : "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Period: </span>
                  <span className="font-medium">
                    {startDate ? format(startDate, "dd MMM yyyy") : ""} - {endDate ? format(endDate, "dd MMM yyyy") : ""}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Days: </span>
                  <span className="font-medium">{data.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10">Sl</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Day</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">In Time</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Out Time</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Hours</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Late (min)</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      No data found. Click &quot;Search&quot; to load attendance.
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{format(new Date(row.date), "dd MMM yyyy")}</td>
                      <td className="px-3 py-2">{format(new Date(row.date), "EEE")}</td>
                      <td className="px-3 py-2">{row.check_in || "-"}</td>
                      <td className="px-3 py-2">{row.check_out || "-"}</td>
                      <td className="px-3 py-2">{row.total_hours || "-"}</td>
                      <td className="px-3 py-2">{row.late_minutes > 0 ? row.late_minutes : "-"}</td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={row.status === "present" ? "default" : row.status === "late" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: Summary */}
          {data.length > 0 && (
            <div className="border-t bg-muted/30 px-4 py-3">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Days: </span>
                  <span className="font-medium">{data.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Present: </span>
                  <span className="font-medium text-green-600">{totalPresent}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Late: </span>
                  <span className="font-medium text-orange-600">{totalLate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Absent: </span>
                  <span className="font-medium text-red-600">{totalAbsent}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Late Minutes: </span>
                  <span className="font-medium">{totalLateMinutes}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
