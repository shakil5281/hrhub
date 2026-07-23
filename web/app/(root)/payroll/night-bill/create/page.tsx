"use client"

import * as React from "react"
import { MoonIcon, ArrowLeftIcon, Loader2, PlusIcon, Trash2Icon, SaveIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { nightBillApi, companyApi, departmentApi, sectionApi, designationApi } from "@/lib/api"
import { FilterBar } from "@/components/filter-bar"
import type { FilterDef } from "@/components/filter-bar"

interface EmployeeRateRow {
  employee_id: string
  name_en: string
  name_bn: string
  punch_number?: string
  department: string
  designation: string
  night_hours: number
  rate: number
  amount: number
}

interface TableRow {
  employee_id: string
  name_en: string
  name_bn: string
  designation: string
  date: string
  night_hours: number
  rate: number
  amount: number
}

export default function CreateNightBillPage() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

  const [rows, setRows] = React.useState<TableRow[]>([])
  const [saving, setSaving] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const [empList, setEmpList] = React.useState<EmployeeRateRow[]>([])
  const [empLoading, setEmpLoading] = React.useState(false)
  const [empSearch, setEmpSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const [companies, setCompanies] = React.useState<Array<{ id: string; company_name_en: string }>>([])
  const [departments, setDepartments] = React.useState<Array<{ id: string; name: string }>>([])
  const [sections, setSections] = React.useState<Array<{ id: string; name: string }>>([])
  const [designations, setDesignations] = React.useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = React.useState<Record<string, string>>({
    date: today,
  })

  React.useEffect(() => {
    companyApi.list({ limit: "100" }).then((res) => {
      const list = res?.data?.data || res?.data || []
      setCompanies(Array.isArray(list) ? list : [])
    }).catch(() => { })
  }, [])

  const fetchEmployees = React.useCallback(async (f: Record<string, string>) => {
    if (!f.company_id) return
    setEmpLoading(true)
    try {
      const params: Record<string, string> = { date: f.date || today }
      if (f.company_id) params.company_id = f.company_id
      if (f.department_id) params.department_id = f.department_id
      if (f.section_id) params.section_id = f.section_id
      if (f.designation_id) params.designation_id = f.designation_id
      const { data: res } = await nightBillApi.listEligibleWithRates(params)
      setEmpList(Array.isArray(res.data) ? res.data : [])
    } catch {
      setEmpList([])
    } finally {
      setEmpLoading(false)
    }
  }, [today])

  const fetchDepartments = React.useCallback(async (companyId: string) => {
    try {
      const { data: res } = await departmentApi.list({ company_id: companyId, limit: "200" })
      setDepartments(Array.isArray(res.data || res.departments) ? (res.data || res.departments) : [])
    } catch { setDepartments([]) }
  }, [])

  const fetchOrgData = React.useCallback(async (companyId: string) => {
    try {
      const [sRes, dRes] = await Promise.all([
        sectionApi.list(undefined, { company_id: companyId, limit: "200" }),
        designationApi.list(undefined, { company_id: companyId, limit: "200" }),
      ])
      const extract = (res: any) => {
        const d = res?.data || res?.sections || res?.designations || []
        return Array.isArray(d) ? d : []
      }
      setSections(extract(sRes))
      setDesignations(extract(dRes))
    } catch { }
  }, [])

  const dialogFilterDefs: FilterDef[] = React.useMemo(() => [
    {
      key: "company_id", label: "Company", type: "select",
      options: companies.map((c) => ({ value: c.id, label: c.company_name_en })),
    },
    {
      key: "department_id", label: "Department", type: "select",
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      key: "section_id", label: "Section", type: "select",
      options: sections.map((s) => ({ value: s.id, label: s.name })),
    },
    {
      key: "designation_id", label: "Designation", type: "select",
      options: designations.map((d) => ({ value: d.id, label: d.name })),
    },
  ], [companies, departments, sections, designations])

  const handleFilterChange = (key: string, value: string) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    if (key === "company_id") {
      fetchDepartments(value)
      fetchOrgData(value)
    }
    fetchEmployees(next)
  }

  const handleFilterApply = () => fetchEmployees(filters)
  const handleFilterReset = () => {
    const defaults = { date: today }
    setFilters(defaults)
    setDepartments([])
    setSections([])
    setDesignations([])
    setEmpList([])
    setSelectedIds(new Set())
  }

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (open) {
      setSelectedIds(new Set())
      setEmpSearch("")
      if (filters.company_id) fetchEmployees(filters)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.employee_id)))
    }
  }

  const handleAddSelected = () => {
    const date = filters.date || today
    const existing = new Set(rows.map((r) => `${r.employee_id}|${r.date}`))
    const toAdd: TableRow[] = []
    for (const emp of filtered) {
      if (!selectedIds.has(emp.employee_id)) continue
      const key = `${emp.employee_id}|${date}`
      if (existing.has(key)) continue
      toAdd.push({
        employee_id: emp.employee_id,
        name_en: emp.name_en,
        name_bn: emp.name_bn,
        designation: emp.designation,
        date,
        night_hours: emp.night_hours,
        rate: emp.rate,
        amount: emp.amount,
      })
    }
    if (toAdd.length === 0) {
      toast.error("Selected employees are already in the table")
      return
    }
    setRows((prev) => [...prev, ...toAdd])
    setDialogOpen(false)
    toast.success(`${toAdd.length} employee(s) added`)
  }

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const filtered = React.useMemo(() => {
    if (!empSearch.trim()) return empList
    const q = empSearch.toLowerCase()
    return empList.filter(
      (e) =>
        e.employee_id.toLowerCase().includes(q) ||
        e.name_en.toLowerCase().includes(q) ||
        e.punch_number?.toLowerCase().includes(q)
    )
  }, [empList, empSearch])

  const handleSave = async () => {
    if (rows.length === 0) { toast.error("No entries to save"); return }
    setSaving(true)
    const companyId = filters.company_id
    if (!companyId) { toast.error("Select a company first"); setSaving(false); return }
    const dateObj = new Date((filters.date || today) + "T00:00:00")
    try {
      await nightBillApi.bulkCreate({
        company_id: companyId,
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
        items: rows.map((r) => ({
          employee_id: r.employee_id,
          date: r.date,
          night_hours: r.night_hours,
          rate: r.rate,
          amount: r.amount,
        })),
      })
      toast.success(`${rows.length} night bill(s) saved`)
      router.push("/payroll/night-bill")
    } catch {
      toast.error("Failed to save night bills")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoonIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Add Night Bill</h1>
            </div>
            <p className="text-muted-foreground mt-1 ml-11">Select employees and auto-calculate night bill rates from attendance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
              Save Night Bills
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Night Bill Entries</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{rows.length} employee(s)</span>
              <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button disabled={!filters.company_id}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Employee Night Bill List</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={empSearch}
                          onChange={(e) => setEmpSearch(e.target.value)}
                          placeholder="Search by ID, name or punch number..."
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <FilterBar
                      filters={dialogFilterDefs}
                      values={filters}
                      onChange={handleFilterChange}
                      onApply={handleFilterApply}
                      onReset={handleFilterReset}
                      submitting={empLoading}
                    />

                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2.5 w-10 text-center">
                              <Checkbox
                                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                                onCheckedChange={toggleSelectAll}
                              />
                            </th>
                            <th className="p-2.5 text-left font-medium">Emp ID</th>
                            <th className="p-2.5 text-left font-medium">Name</th>
                            <th className="p-2.5 text-left font-medium hidden md:table-cell">Dept</th>
                            <th className="p-2.5 text-left font-medium hidden md:table-cell">Designation</th>
                            <th className="p-2.5 text-right font-medium">Hours</th>
                            <th className="p-2.5 text-right font-medium">Rate</th>
                            <th className="p-2.5 text-right font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empLoading ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                              </td>
                            </tr>
                          ) : filtered.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                No employees found. Select a company and date first.
                              </td>
                            </tr>
                          ) : (
                            filtered.map((emp) => (
                              <tr
                                key={emp.employee_id}
                                className={`border-b hover:bg-muted/50 transition-colors ${selectedIds.has(emp.employee_id) ? "bg-accent/30" : ""}`}
                              >
                                <td className="p-2.5 text-center">
                                  <Checkbox
                                    checked={selectedIds.has(emp.employee_id)}
                                    onCheckedChange={() => toggleSelect(emp.employee_id)}
                                  />
                                </td>
                                <td className="p-2.5 font-mono text-xs">{emp.employee_id}</td>
                                <td className="p-2.5">
                                  <div className="font-medium">{emp.name_en}</div>
                                  {emp.name_bn && <div className="text-xs text-muted-foreground">{emp.name_bn}</div>}
                                </td>
                                <td className="p-2.5 text-muted-foreground text-xs hidden md:table-cell">{emp.department || "-"}</td>
                                <td className="p-2.5 text-muted-foreground text-xs hidden md:table-cell">{emp.designation || "-"}</td>
                                <td className="p-2.5 text-right font-mono text-xs">{emp.night_hours > 0 ? emp.night_hours.toFixed(2) : "—"}</td>
                                <td className="p-2.5 text-right font-mono text-xs">৳{emp.rate.toFixed(2)}</td>
                                <td className="p-2.5 text-right font-mono text-xs font-medium">{emp.amount > 0 ? `৳${emp.amount.toFixed(2)}` : "—"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {selectedIds.size} of {filtered.length} selected
                      </span>
                      <Button onClick={handleAddSelected} disabled={selectedIds.size === 0}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Selected ({selectedIds.size})
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Employee ID</th>
                  <th className="p-3 text-left font-medium">Employee Name</th>
                  <th className="p-3 text-left font-medium">Designation</th>
                  <th className="p-3 text-center font-medium">Date</th>
                  <th className="p-3 text-right font-medium">Hours</th>
                  <th className="p-3 text-right font-medium">Rate (৳)</th>
                  <th className="p-3 text-right font-medium">Amount (৳)</th>
                  <th className="p-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No entries yet. Click "Add Employee" to add employees from the list.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={`${row.employee_id}-${row.date}-${idx}`} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{row.employee_id}</td>
                      <td className="p-3">
                        <div className="font-medium">{row.name_en}</div>
                        {row.name_bn && <div className="text-xs text-muted-foreground">{row.name_bn}</div>}
                      </td>
                      <td className="p-3 text-muted-foreground">{row.designation}</td>
                      <td className="p-3 text-center font-mono text-xs">{row.date}</td>
                      <td className="p-3 text-right font-mono">{row.night_hours.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">৳{row.rate.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-medium">৳{row.amount.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeRow(idx)}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t bg-muted/30 font-medium">
                    <td className="p-3" colSpan={4}>Total: {rows.length} employee(s)</td>
                    <td className="p-3 text-right font-mono">
                      {rows.reduce((s, r) => s + r.night_hours, 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono">—</td>
                    <td className="p-3 text-right font-mono">
                      ৳{rows.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
