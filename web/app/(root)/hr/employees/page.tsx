"use client"

import * as React from "react"
import { UsersIcon, PlusIcon, SearchIcon, RotateCcwIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { DatePicker } from "@/components/ui/date-picker"
import { useRouter } from "next/navigation"
import { Employee, getEmployees, deleteEmployee, departmentOptions, statusOptionsEmployee } from "@/components/employee-data"

const columns: ColumnDef<Employee>[] = [
  { accessorKey: "employeeCode", header: "Code" },
  { accessorKey: "nameEn", header: "Name" },
  { accessorKey: "designation", header: "Designation" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Active" ? "default" : "secondary"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
]

export default function EmployeesPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Employee[]>([])

  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>()
  const [dateTo, setDateTo] = React.useState<Date | undefined>()

  const loadData = React.useCallback(() => setData(getEmployees()), [])

  React.useEffect(loadData, [loadData])

  const filtered = React.useMemo(() => {
    let result = data
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.nameEn.toLowerCase().includes(q) ||
          e.nameBn.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q)
      )
    }
    if (deptFilter !== "all") result = result.filter((e) => e.department === deptFilter)
    if (statusFilter !== "all") result = result.filter((e) => e.status === statusFilter)
    if (dateFrom) result = result.filter((e) => new Date(e.joiningDate) >= dateFrom)
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      result = result.filter((e) => new Date(e.joiningDate) <= end)
    }
    return result
  }, [data, search, deptFilter, statusFilter, dateFrom, dateTo])

  const clearFilters = () => {
    setSearch("")
    setDeptFilter("all")
    setStatusFilter("all")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasFilters = search || deptFilter !== "all" || statusFilter !== "all" || dateFrom || dateTo

  const handleEdit = (emp: Employee) => router.push(`/hr/employees/${emp.id}/edit`)
  const handleDelete = (emp: Employee) => { deleteEmployee(emp.id); loadData() }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage employee records</p>
          </div>
        </div>
        <Button onClick={() => router.push("/hr/employees/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Name or code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All Statuses</option>
                {statusOptionsEmployee.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">From (Joining)</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">To (Joining)</label>
              <DatePicker value={dateTo} onChange={setDateTo} placeholder="To date" />
            </div>
          </div>
          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcwIcon className="mr-1 size-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <DataTable key={filtered.length} data={filtered} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
