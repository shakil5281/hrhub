"use client"

import * as React from "react"
import { LandmarkIcon, Loader2, FileDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { salaryApi, companyApi, groupApi } from "@/lib/api"
import { toast } from "sonner"

interface Company { id: string; company_name_en: string }
interface Group { id: string; name: string }

interface BankRecord {
  id: string
  employee: {
    employee_id: string
    name_en: string
    account_type: string
    account_number: string
    designation_ref?: { name: string }
    department?: { name: string }
    group_ref?: { id: string; name: string }
    line_ref?: { id: string; name: string }
  }
  net_salary: number
  gross_salary: number
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()
const YEARS = Array.from({length:10},(_,i)=>currentYear-5+i)

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface TabConfig {
  value: string
  label: string
  groupName: string
  accountType: string
}

const tabs: TabConfig[] = [
  { value: "summary", label: "Summary", groupName: "", accountType: "" },
  { value: "staff-mcash", label: "Staff-mCash", groupName: "Staff", accountType: "mCash" },
  { value: "staff-card", label: "Staff-Card", groupName: "Staff", accountType: "Card" },
  { value: "worker-mcash", label: "Worker-mCash", groupName: "Worker", accountType: "mCash" },
  { value: "worker-card", label: "Worker-Card", groupName: "Worker", accountType: "Card" },
]

export default function BankSheetPage() {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [groups, setGroups] = React.useState<Group[]>([])
  const [companyId, setCompanyId] = React.useState("")
  const [month, setMonth] = React.useState(currentMonth)
  const [year, setYear] = React.useState(currentYear)
  const [tabData, setTabData] = React.useState<Record<string, BankRecord[]>>({})
  const [loading, setLoading] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("summary")

  React.useEffect(() => {
    Promise.all([
      companyApi.list({ limit: "100" }),
      groupApi.list({ limit: "100" }),
    ]).then(([c, g]) => {
      const clist = Array.isArray(c.data?.data) ? c.data.data : (Array.isArray(c.data) ? c.data : [])
      if (clist.length > 0) { setCompanies(clist); setCompanyId(clist[0].id) }
      const glist = Array.isArray(g.data?.data) ? g.data.data : []
      setGroups(glist)
    })
  }, [])

  const groupIdByName = React.useCallback((name: string) => {
    return groups.find((g) => g.name === name)?.id || ""
  }, [groups])

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const results: Record<string, BankRecord[]> = {}
      for (const tab of tabs) {
        const params: Record<string, string> = {
          company_id: companyId,
          month: String(month + 1),
          year: String(year),
        }
        if (tab.groupName) {
          const gid = groupIdByName(tab.groupName)
          if (gid) params.group_id = gid
        }
        if (tab.accountType) params.account_type = tab.accountType
        const { data: res } = await salaryApi.bankSheet(params)
        results[tab.value] = (res.salaries || []).map((s: any, i: number) => ({ ...s, id: s.id || `s-${tab.value}-${i}` }))
      }
      setTabData(results)
    } catch {
      toast.error("Failed to load bank data")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!companyId) return
    setExporting(true)
    try {
      const params: Record<string, string> = { company_id: companyId, month: String(month + 1), year: String(year) }
      const staffId = groupIdByName("Staff")
      const workerId = groupIdByName("Worker")
      if (staffId) params.staff_group_id = staffId
      if (workerId) params.worker_group_id = workerId
      const res = await salaryApi.bankSheetExport(params)
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bank_sheet_${MONTHS[month]}_${year}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to export bank sheet")
    } finally {
      setExporting(false)
    }
  }

  React.useEffect(() => { fetchData() }, [companyId, month, year, groupIdByName])

  const currentData = tabData[activeTab] || []
  const totalNet = currentData.reduce((sum, r) => sum + (r.net_salary || 0), 0)

  const lineGroups = React.useMemo(() => {
    const groups = new Map<string, BankRecord[]>()
    for (const r of currentData) {
      const lineName = r.employee?.line_ref?.name || "No Line"
      if (!groups.has(lineName)) groups.set(lineName, [])
      groups.get(lineName)!.push(r)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [currentData])

  const isSummary = activeTab === "summary"

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <LandmarkIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Sheet</h1>
            <p className="text-muted-foreground mt-1">Salary bank transfer summary</p>
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
                <select value={companyId} onChange={e => setCompanyId(e.target.value)} className="flex h-10 w-60 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.company_name_en}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Month</label>
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {MONTHS.map((n, i) => <option key={n} value={i}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Year</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Button onClick={fetchData} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LandmarkIcon className="mr-2 h-4 w-4" />}
                Load
              </Button>
              <Button onClick={handleExport} disabled={exporting || loading} variant="outline">
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold mb-2">{MONTHS[month]} {year} - Bank Sheet</h2>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : currentData.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No data found</div>
              ) : isSummary ? (
                <>
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10">Sl</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Line</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Employee ID</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Account Number</th>
                            <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Net Salary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineGroups.map(([lineName, records], groupIndex) => {
                            const lineNet = records.reduce((s, r) => s + (r.net_salary || 0), 0)
                            const offset = lineGroups.slice(0, groupIndex).reduce((s, [, r]) => s + r.length, 0)
                            return (
                              <React.Fragment key={lineName}>
                                <tr className="border-b bg-muted/30 font-semibold">
                                  <td className="px-3 py-2" colSpan={1}></td>
                                  <td className="px-3 py-2" colSpan={5}>
                                    {lineName} <span className="font-normal text-muted-foreground">({records.length} employees)</span>
                                  </td>
                                </tr>
                                {records.map((row, ri) => {
                                  const sl = offset + ri + 1
                                  return (
                                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                      <td className="px-3 py-2 text-muted-foreground text-xs">{sl}</td>
                                      <td className="px-3 py-2 text-muted-foreground text-xs">{lineName}</td>
                                      <td className="px-3 py-2 font-mono text-xs">{row.employee?.employee_id}</td>
                                      <td className="px-3 py-2 font-medium">{row.employee?.name_en || "-"}</td>
                                      <td className="px-3 py-2 font-mono">{row.employee?.account_number || "-"}</td>
                                      <td className="px-3 py-2 text-right font-semibold">{fmt(row.net_salary)}</td>
                                    </tr>
                                  )
                                })}
                                <tr className="border-b bg-muted/10 text-sm font-semibold">
                                  <td className="px-3 py-2" colSpan={5}></td>
                                  <td className="px-3 py-2 text-right text-green-700">{fmt(lineNet)}</td>
                                </tr>
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-4 mt-4 flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Employees</span>
                      <p className="font-semibold text-lg">{currentData.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Lines</span>
                      <p className="font-semibold text-lg">{lineGroups.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Net Salary</span>
                      <p className="font-semibold text-lg">{fmt(totalNet)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10">Sl</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Employee ID</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Account Number</th>
                            <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Net Salary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.map((row, i) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="px-3 py-2">{i + 1}</td>
                              <td className="px-3 py-2 font-mono text-xs">{row.employee?.employee_id}</td>
                              <td className="px-3 py-2 font-medium">{row.employee?.name_en || "-"}</td>
                              <td className="px-3 py-2 font-mono">{row.employee?.account_number || "-"}</td>
                              <td className="px-3 py-2 text-right font-semibold">{fmt(row.net_salary)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4 mt-4 flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Employees</span>
                      <p className="font-semibold text-lg">{currentData.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Net Salary</span>
                      <p className="font-semibold text-lg">{fmt(totalNet)}</p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
