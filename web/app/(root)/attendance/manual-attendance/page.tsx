"use client"

import * as React from "react"
import { ClipboardCheckIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { employeeApi, attendanceApi } from "@/lib/api"
import { format } from "date-fns"

interface Employee {
  id: string
  employee_id: string
  name_en: string
  company_id: string
}

export default function ManualAttendancePage() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const [selectedEmployee, setSelectedEmployee] = React.useState("")
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [checkIn, setCheckIn] = React.useState("")
  const [checkOut, setCheckOut] = React.useState("")
  const [status, setStatus] = React.useState("present")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      try {
        const { data: res } = await employeeApi.list()
        setEmployees(res.employees || res || [])
      } catch {
        toast.error("Failed to load employees")
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee")
      return
    }
    if (!date) {
      toast.error("Please select a date")
      return
    }

    setSubmitting(true)
    try {
      const employee = employees.find((e) => e.id === selectedEmployee)
      const body: Record<string, unknown> = {
        employee_id: selectedEmployee,
        company_id: employee?.company_id || "",
        date: format(date, "yyyy-MM-dd"),
        status,
      }
      if (checkIn) body.check_in = checkIn
      if (checkOut) body.check_out = checkOut

      await attendanceApi.create(body)
      toast.success("Attendance saved successfully")

      setSelectedEmployee("")
      setDate(new Date())
      setCheckIn("")
      setCheckOut("")
      setStatus("present")
      setNotes("")
    } catch {
      toast.error("Failed to save attendance")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ClipboardCheckIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manual Attendance</h1>
            <p className="text-muted-foreground mt-1">Manually add or update employee attendance</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-6 max-w-2xl">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={loading}
                className="h-10 rounded border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                <option value="">{loading ? "Loading..." : "Select employee"}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </label>
              <DatePicker value={date} onChange={setDate} className="max-w-xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Check In</label>
                <TimePicker value={checkIn} onChange={setCheckIn} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Check Out</label>
                <TimePicker value={checkOut} onChange={setCheckOut} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 max-w-xs"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Attendance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
