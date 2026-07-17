"use client"

import * as React from "react"
import { FileBarChartIcon, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { salaryApi, companyApi } from "@/lib/api"
import { toast } from "sonner"

interface Company { id: string; company_name_en: string }

interface DeptSummary extends Record<string, unknown> {
  id: string
  department: string
  employees: number
  house_rent: number
  medical: number
  transport: number
  gross_salary: number
  deductions: number
  net_salary: number
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()
const YEARS = Array.from({length:10},(_,i)=>currentYear-5+i)

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const columns: ColumnDef<DeptSummary>[] = [
  { accessorKey: "department", header: "Department" },
  { accessorKey: "employees", header: "Employees" },
  { accessorKey: "gross_salary", header: "Basic Total", cell: ({row}) => fmt(row.original.gross_salary) },
  { accessorKey: "house_rent", header: "House Rent", cell: ({row}) => fmt(row.original.house_rent) },
  { accessorKey: "medical", header: "Medical", cell: ({row}) => fmt(row.original.medical) },
  { accessorKey: "transport", header: "Transport", cell: ({row}) => fmt(row.original.transport) },
  { accessorKey: "deductions", header: "Deductions", cell: ({row}) => fmt(row.original.deductions) },
  { accessorKey: "net_salary", header: "Net Total", cell: ({row}) => fmt(row.original.net_salary) },
]

export default function SalarySummaryPage() {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [companyId, setCompanyId] = React.useState("")
  const [month, setMonth] = React.useState(currentMonth)
  const [year, setYear] = React.useState(currentYear)
  const [data, setData] = React.useState<{
    summaries: DeptSummary[]
    total_employees: number
    grand_totals: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    companyApi.list().then(({data})=>{
      if (Array.isArray(data) && data.length>0) {
        setCompanies(data)
        setCompanyId(data[0].id)
      }
    })
  }, [])

  const handleLoad = async () => {
    if (!companyId) { toast.error("Select a company"); return }
    setLoading(true)
    try {
      const { data: res } = await salaryApi.summary({ company_id: companyId, month: String(month+1), year: String(year) })
      setData({...res, summaries: res.summaries.map((s: DeptSummary, i: number) => ({...s, id: `s-${i}`}))})
    } catch { toast.error("Failed to load summary") }
    finally { setLoading(false) }
  }

  React.useEffect(() => { if (companyId) handleLoad() }, [companyId, month, year])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <FileBarChartIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Salary Summary</h1>
            <p className="text-muted-foreground mt-1">Salary summary by department</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Company</label>
                <select value={companyId} onChange={e=>setCompanyId(e.target.value)} className="flex h-10 w-60 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {companies.map(c=><option key={c.id} value={c.id}>{c.company_name_en}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Month</label>
                <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {MONTHS.map((n,i)=><option key={n} value={i}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Year</label>
                <select value={year} onChange={e=>setYear(Number(e.target.value))} className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Button onClick={handleLoad} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileBarChartIcon className="mr-2 h-4 w-4" />}
                Load
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : data ? (
        <div className="px-4 lg:px-6">
          <h2 className="text-lg font-semibold mb-2">{MONTHS[month]} {year} - Salary Summary</h2>
          <DataTable data={data.summaries} columns={columns} />
          <div className="mt-4 rounded-md border bg-muted/30 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
              <div><span className="text-muted-foreground">Total Employees</span><p className="font-semibold">{data.total_employees}</p></div>
              <div><span className="text-muted-foreground">Gross Total</span><p className="font-semibold">{fmt(data.grand_totals.gross_salary)}</p></div>
              <div><span className="text-muted-foreground">House Rent</span><p className="font-semibold">{fmt(data.grand_totals.house_rent)}</p></div>
              <div><span className="text-muted-foreground">Medical</span><p className="font-semibold">{fmt(data.grand_totals.medical)}</p></div>
              <div><span className="text-muted-foreground">Transport</span><p className="font-semibold">{fmt(data.grand_totals.transport)}</p></div>
              <div><span className="text-muted-foreground">Deductions</span><p className="font-semibold">{fmt(data.grand_totals.deductions)}</p></div>
              <div><span className="text-muted-foreground">Net Total</span><p className="font-semibold">{fmt(data.grand_totals.net_salary)}</p></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 lg:px-6 text-center text-muted-foreground py-12">Select filters and click Load to view salary summary</div>
      )}
    </div>
  )
}
