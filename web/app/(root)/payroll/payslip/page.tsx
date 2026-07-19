"use client"

import * as React from "react"
import { ReceiptIcon, Loader2, SearchIcon } from "lucide-react"
import { salaryApi, companyApi, employeeApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Company { id: string; company_name_en: string }
interface Employee { id: string; employee_id: string; name_en: string }

interface PayslipData {
  employee?: { employee_id:string; name_en:string; designation_ref?:{name:string}; joining_date:string }
  basic_salary: number
  house_rent: number
  medical_allowance: number
  transport_allowance: number
  food_allowance: number
  other_allowance: number
  gross_salary: number
  provident_fund: number
  tax: number
  absent_deduction: number
  total_deductions: number
  overtime_hours: number
  overtime_rate: number
  overtime_amount: number
  attendance_bonus: number
  net_salary: number
  present_days: number
  absent_days: number
  late_days: number
  leave_days: number
  weekend_days: number
  total_days: number
  status: string
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()
const YEARS = Array.from({length:10},(_,i)=>currentYear-5+i)

export default function PaySlipPage() {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [companyId, setCompanyId] = React.useState("")
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [employeeId, setEmployeeId] = React.useState("")
  const [month, setMonth] = React.useState(currentMonth)
  const [year, setYear] = React.useState(currentYear)
  const [payslip, setPayslip] = React.useState<PayslipData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)

  React.useEffect(() => {
    companyApi.list({ limit: "100" }).then(({data})=>{ const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []); if (list.length>0) { setCompanies(list); setCompanyId(list[0].id) } })
  }, [])

  React.useEffect(() => {
    if (!companyId) return
    employeeApi.list({ company_id: companyId, limit: "100" }).then(({data}:any)=>{ const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []); setEmployees(list) })
  }, [companyId])

  const handleSearch = async () => {
    if (!employeeId) return
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await salaryApi.payslip({ employee_id: employeeId, month: String(month+1), year: String(year) })
      setPayslip(data)
    } catch {
      setPayslip(null)
    }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payslip</h1>
            <p className="text-muted-foreground mt-1">View employee payslip</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company</label>
              <select value={companyId} onChange={e=>{setCompanyId(e.target.value);setEmployeeId("")}} className="flex h-9 w-60 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="">Select</option>
                {companies.map(c=><option key={c.id} value={c.id}>{c.company_name_en}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Employee</label>
              <select value={employeeId} onChange={e=>setEmployeeId(e.target.value)} className="flex h-9 w-60 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="">Select employee</option>
                {employees.map(e=><option key={e.id} value={e.id}>{e.employee_id} - {e.name_en}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Month</label>
              <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                {MONTHS.map((n,i)=><option key={n} value={i}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Year</label>
              <select value={year} onChange={e=>setYear(Number(e.target.value))} className="flex h-9 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button onClick={handleSearch} disabled={loading||!employeeId}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </div>
      </div>

      {searched && !payslip && !loading && (
        <div className="px-4 lg:px-6">
          <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            No payslip found for this employee. Process salary first.
          </div>
        </div>
      )}

      {loading && (
        <div className="px-4 lg:px-6 flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      )}

      {payslip && (
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payslip - {MONTHS[month]} {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
                <div><span className="text-sm text-muted-foreground">Employee:</span> <strong>{payslip.employee?.name_en}</strong></div>
                <div><span className="text-sm text-muted-foreground">Code:</span> <strong>{payslip.employee?.employee_id}</strong></div>
                <div><span className="text-sm text-muted-foreground">Designation:</span> <strong>{payslip.employee?.designation_ref?.name || "-"}</strong></div>
              </div>

              <h3 className="font-semibold mb-2">Earnings</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex justify-between p-2 rounded border"><span>Transport Allowance</span><span>{payslip.transport_allowance.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>Food Allowance</span><span>{payslip.food_allowance.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>Other Allowance</span><span>{payslip.other_allowance.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border font-semibold bg-primary/5"><span>Gross Salary</span><span>{payslip.gross_salary.toLocaleString()}</span></div>
              </div>

              <h3 className="font-semibold mb-2">Overtime & Bonus</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex justify-between p-2 rounded border"><span>OT Hours</span><span>{payslip.overtime_hours?.toFixed(2)}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>OT Rate</span><span>{payslip.overtime_rate?.toFixed(2)}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>OT Amount</span><span>{payslip.overtime_amount?.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>Attendance Bonus</span><span>{payslip.attendance_bonus?.toLocaleString()}</span></div>
              </div>

              <h3 className="font-semibold mb-2">Deductions</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex justify-between p-2 rounded border"><span>Provident Fund</span><span>{payslip.provident_fund.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>Tax</span><span>{payslip.tax.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border"><span>Absent Deduction</span><span>{payslip.absent_deduction.toLocaleString()}</span></div>
                <div className="flex justify-between p-2 rounded border font-semibold bg-destructive/5"><span>Total Deductions</span><span>{payslip.total_deductions.toLocaleString()}</span></div>
              </div>

              <div className="flex justify-between p-4 rounded-lg border-2 border-primary/20 bg-primary/5 text-lg font-bold mt-2">
                <span>Net Salary</span>
                <span>{payslip.net_salary.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 text-sm text-muted-foreground">
                <span>Present: <strong>{payslip.present_days}</strong></span>
                <span>Absent: <strong>{payslip.absent_days}</strong></span>
                <span>Late: <strong>{payslip.late_days}</strong></span>
                <span>Leave: <strong>{payslip.leave_days}</strong></span>
                <span>Weekend: <strong>{payslip.weekend_days}</strong></span>
                <span>Total Days: <strong>{payslip.total_days}</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
