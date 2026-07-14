"use client"

import * as React from "react"
import { UsersIcon, PlusIcon, SearchIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Employee, statusOptionsEmployee } from "@/components/data/employee-data"
import { employeeApi } from "@/lib/api"

const columns: ColumnDef<Employee>[] = [
  { accessorKey: "employee_code", header: "Code" },
  { accessorKey: "name_en", header: "Name" },
  { accessorKey: "designation", header: "Designation" },
  { accessorKey: "punch_number", header: "Punch No" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "joining_date", header: "Joining Date" },
  {
    accessorKey: "total_salary",
    header: "Salary",
    cell: ({ row }) => row.original.total_salary?.toLocaleString() || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"} className="capitalize">
        {statusOptionsEmployee.find((s) => s.value === row.original.status)?.label}
      </Badge>
    ),
  },
]

export default function EmployeesPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")

  const fetchEmployees = async () => {
    setLoading(true)
    setError("")
    try {
      const { data: res } = await employeeApi.list()
      setData(Array.isArray(res) ? res : [])
    } catch {
      setError("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchEmployees()
  }, [])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (e) =>
        e.employee_code.toLowerCase().includes(q) ||
        e.name_en.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
    )
  }, [data, search])

  const handleEdit = (emp: Employee) => router.push(`/hr/employees/${emp.id}/edit`)
  const handleDelete = async (emp: Employee) => {
    try {
      await employeeApi.delete(emp.id)
      setData((prev) => prev.filter((e) => e.id !== emp.id))
    } catch {
      setError("Failed to delete employee")
    }
  }

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

      {error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by code, name or designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-4 lg:px-6 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable key={filtered.length} data={filtered} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
