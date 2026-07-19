"use client"

import * as React from "react"
import { ClockIcon, Loader2 } from "lucide-react"
import { employeeApi } from "@/lib/api"

function calcJobAge(joiningDate: string): string {
  if (!joiningDate) return "-"
  const join = new Date(joiningDate)
  const now = new Date()
  let years = now.getFullYear() - join.getFullYear()
  let months = now.getMonth() - join.getMonth()
  let days = now.getDate() - join.getDate()
  if (days < 0) { months--; const prev = new Date(now.getFullYear(), now.getMonth(), 0); days += prev.getDate() }
  if (months < 0) { years--; months += 12 }
  const parts: string[] = []
  if (years > 0) parts.push(`${years}y`)
  if (months > 0) parts.push(`${months}m`)
  parts.push(`${days}d`)
  return parts.join(" ")
}

interface EmpRow {
  id: string
  employee_id: string
  name_en: string
  joining_date: string
  job_age: string
}

export default function JobAgePage() {
  const [rows, setRows] = React.useState<EmpRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    employeeApi.list({ status: "active", limit: "500" })
      .then((res) => {
        const list: any[] = res.data?.data || []
        setRows(list.map((e: any) => ({ ...e, job_age: calcJobAge(e.joining_date) })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      r.employee_id?.toLowerCase().includes(q) || r.name_en?.toLowerCase().includes(q)
    )
  }, [rows, search])

  const stats = React.useMemo(() => {
    if (rows.length === 0) return null
    const ages = rows.map((r) => {
      if (!r.joining_date) return 0
      return (new Date().getTime() - new Date(r.joining_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    })
    const avg = ages.reduce((a, b) => a + b, 0) / ages.length
    const max = Math.max(...ages)
    const min = Math.min(...ages.filter((a) => a > 0))
    return { avg: avg.toFixed(1), max: max.toFixed(1), min: min.toFixed(1), total: rows.length }
  }, [rows])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <ClockIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Age</h1>
          <p className="text-muted-foreground mt-1">Employee tenure report</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 lg:px-6">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Active</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Avg Tenure</p>
            <p className="text-2xl font-bold mt-1">{stats.avg} yrs</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Longest</p>
            <p className="text-2xl font-bold mt-1">{stats.max} yrs</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Shortest</p>
            <p className="text-2xl font-bold mt-1">{stats.min} yrs</p>
          </div>
        </div>
      )}

      <div className="px-4 lg:px-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID or name..."
          className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">No employees found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-12">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Employee ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Joining Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Job Age</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-4 font-medium">{r.employee_id}</td>
                      <td className="py-2.5 px-4">{r.name_en}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{r.joining_date || "-"}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                          {r.job_age}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
