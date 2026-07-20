"use client"

import * as React from "react"
import { FileSpreadsheetIcon, LandmarkIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { salaryApi, companyApi } from "@/lib/api"

interface Company { id: string; company_name_en: string }

interface EmployeeInfo {
  employee_id: string
  name_en: string
  designation_ref?: { name: string }
  joining_date: string
  department?: { name: string }
}

interface SalaryRecord {
  id: string
  employee: EmployeeInfo
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

export default function SalarySheetPage() {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [companyId, setCompanyId] = React.useState("")
  const [month, setMonth] = React.useState(currentMonth)
  const [year, setYear] = React.useState(currentYear)
  const [data, setData] = React.useState<SalaryRecord[]>([])
  const [totals, setTotals] = React.useState<Record<string,number> | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    companyApi.list({ limit: "100" }).then(({data})=>{ const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []); if (list.length>0) { setCompanies(list); setCompanyId(list[0].id) } })
  }, [])

  const fetchData = React.useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data: res } = await salaryApi.sheet({ company_id: companyId, month: String(month+1), year: String(year) })
      setData((res.salaries||[]).map((s:any,i:number)=>({...s,id:s.id||`s-${i}`})))
      setTotals(res.totals||null)
    } catch { setData([]); setTotals(null) }
    finally { setLoading(false) }
  }, [companyId, month, year])

  React.useEffect(() => { fetchData() }, [fetchData])

  const cols: ColumnDef<SalaryRecord>[] = [
    {id:"sl",header:"Sl",cell:({row}:any)=>row.index+1},
    {id:"emp_code",header:"Employee ID",accessorFn:(r:any)=>r.employee?.employee_id},
    {id:"emp_name",header:"Name",accessorFn:(r:any)=>r.employee?.name_en},
    {id:"designation",header:"Designation",accessorFn:(r:any)=>r.employee?.designation_ref?.name||"-"},
    {id:"joining_date",header:"Joining Date",accessorFn:(r:any)=>r.employee?.joining_date?.split("T")[0]},
    {accessorKey:"total_days",header:"Working Days"},
    {accessorKey:"absent_days",header:"Absent"},
    {accessorKey:"weekend_days",header:"Weekend"},
    {accessorKey:"leave_days",header:"Leave"},
    {accessorKey:"transport_allowance",header:"Transport",cell:({row}:any)=>row.original.transport_allowance.toLocaleString()},
    {accessorKey:"food_allowance",header:"Food",cell:({row}:any)=>row.original.food_allowance.toLocaleString()},
    {accessorKey:"other_allowance",header:"Other",cell:({row}:any)=>row.original.other_allowance.toLocaleString()},
    {accessorKey:"gross_salary",header:"Gross",cell:({row}:any)=>row.original.gross_salary.toLocaleString()},
    {accessorKey:"absent_deduction",header:"Absent Ded.",cell:({row}:any)=>row.original.absent_deduction.toLocaleString()},
    {accessorKey:"overtime_hours",header:"OT Hours",cell:({row}:any)=>row.original.overtime_hours.toFixed(2)},
    {accessorKey:"overtime_rate",header:"OT Rate",cell:({row}:any)=>row.original.overtime_rate.toFixed(2)},
    {accessorKey:"overtime_amount",header:"OT Amount",cell:({row}:any)=>row.original.overtime_amount.toLocaleString()},
    {accessorKey:"attendance_bonus",header:"Att. Bonus",cell:({row}:any)=>row.original.attendance_bonus.toLocaleString()},
    {accessorKey:"net_salary",header:"Net Salary",cell:({row}:any)=>row.original.net_salary.toLocaleString()},
    {accessorKey:"status",header:"Status"},
  ]
  const columns = cols

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheetIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Salary Sheet</h1>
            <p className="text-muted-foreground mt-1">Employee attendance breakdown</p>
          </div>
        </div>
        <Link href="/payroll/bank-sheet">
          <Button variant="outline" size="sm">
            <LandmarkIcon className="mr-2 h-4 w-4" />
            Bank Sheet
          </Button>
        </Link>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company</label>
              <select value={companyId} onChange={e=>setCompanyId(e.target.value)} className="flex h-9 w-60 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="">Select</option>
                {companies.map(c=><option key={c.id} value={c.id}>{c.company_name_en}</option>)}
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
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold mb-2">{MONTHS[month]} {year} - Salary Sheet</h2>
      </div>

      <>
        {totals && (
          <div className="px-4 lg:px-6">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mb-2 p-3 rounded-lg border bg-card">
              <span>Gross: <strong className="text-foreground">{totals.gross_salary?.toLocaleString()}</strong></span>
              <span>Absent Ded.: <strong className="text-foreground">{totals.absent_deduction?.toLocaleString()}</strong></span>
              <span>OT Hrs: <strong className="text-foreground">{totals.overtime_hours?.toFixed(2)}</strong></span>
              <span>OT Amt: <strong className="text-foreground">{totals.overtime_amount?.toLocaleString()}</strong></span>
              <span>Att. Bonus: <strong className="text-foreground">{totals.attendance_bonus?.toLocaleString()}</strong></span>
              <span>Deductions: <strong className="text-foreground">{totals.total_deductions?.toLocaleString()}</strong></span>
              <span>Net: <strong className="text-foreground">{totals.net_salary?.toLocaleString()}</strong></span>
            </div>
          </div>
        )}
        <DataTable data={data} columns={columns} loading={loading} />
      </>
    </div>
  )
}
