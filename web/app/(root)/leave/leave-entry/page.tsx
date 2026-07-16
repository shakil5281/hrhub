"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"
import { leaveApi, companyApi, employeeApi, leaveTypeApi } from "@/lib/api"

interface Company { id: string; company_name_en: string }
interface Employee { id: string; employee_code: string; name_en: string }
interface LeaveType { id: string; name: string; total_days: number }

export default function LeaveEntryPage() {
  const router = useRouter()
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [leaveTypes, setLeaveTypes] = React.useState<LeaveType[]>([])
  const [companyId, setCompanyId] = React.useState("")
  const [employeeId, setEmployeeId] = React.useState("")
  const [leaveTypeId, setLeaveTypeId] = React.useState("")
  const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined)
  const [toDate, setToDate] = React.useState<Date | undefined>(undefined)
  const [reason, setReason] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      companyApi.list(),
      employeeApi.list(),
      leaveTypeApi.list(),
    ]).then(([cRes, eRes, lRes]) => {
      setCompanies(Array.isArray(cRes.data) ? cRes.data : [])
      setEmployees(Array.isArray(eRes.data) ? eRes.data : [])
      setLeaveTypes(Array.isArray(lRes.data) ? lRes.data : [])
    }).catch(() => toast.error("Failed to load data"))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId || !employeeId || !leaveTypeId || !fromDate || !toDate) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      await leaveApi.apply({
        company_id: companyId,
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        from_date: format(fromDate, "yyyy-MM-dd"),
        to_date: format(toDate, "yyyy-MM-dd"),
        reason: reason || undefined,
      })
      toast.success("Leave applied successfully")
      router.push("/leave/leave")
    } catch {
      toast.error("Failed to apply leave")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Entry</h1>
          <p className="text-muted-foreground mt-1">Apply for employee leave</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 lg:px-6 max-w-2xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company_id">Company *</Label>
          <select
            id="company_id"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.company_name_en}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_id">Employee *</Label>
          <select
            id="employee_id"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.employee_code} - {e.name_en}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leave_type_id">Leave Type *</Label>
          <select
            id="leave_type_id"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.total_days} days)</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Date *</Label>
            <DatePicker value={fromDate} onChange={setFromDate} />
          </div>
          <div className="space-y-2">
            <Label>To Date *</Label>
            <DatePicker value={toDate} onChange={setToDate} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional reason..." />
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Apply Leave"}
          </Button>
        </div>
      </form>
    </div>
  )
}
