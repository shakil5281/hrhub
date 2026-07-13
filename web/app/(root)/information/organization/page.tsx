"use client"

import * as React from "react"
import { BuildingIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Organization, getOrganizations, deleteOrganization, departmentOptions, sectionOptions, designationOptions, lineOptions } from "@/components/organization-data"

const columns: ColumnDef<Organization>[] = [
  { accessorKey: "department", header: "Department" },
  { accessorKey: "section", header: "Section" },
  { accessorKey: "designation", header: "Designation" },
  { accessorKey: "line", header: "Line" },
]

export default function OrganizationPage() {
  const router = useRouter()
  const [data, setData] = React.useState<Organization[]>([])
  const [tab, setTab] = React.useState("all")
  React.useEffect(() => setData(getOrganizations()), [])

  const [deptFilter, setDeptFilter] = React.useState("all")
  const [sectionFilter, setSectionFilter] = React.useState("all")
  const [desigFilter, setDesigFilter] = React.useState("all")
  const [lineFilter, setLineFilter] = React.useState("all")

  const filtered = React.useMemo(() => {
    let result = data
    if (deptFilter !== "all") result = result.filter((d) => d.department === deptFilter)
    if (sectionFilter !== "all") result = result.filter((d) => d.section === sectionFilter)
    if (desigFilter !== "all") result = result.filter((d) => d.designation === desigFilter)
    if (lineFilter !== "all") result = result.filter((d) => d.line === lineFilter)
    return result
  }, [data, deptFilter, sectionFilter, desigFilter, lineFilter])

  const groupBy = <T extends keyof Organization>(key: T): { group: string; items: Organization[] }[] => {
    const map = new Map<string, Organization[]>()
    filtered.forEach((item) => {
      const g = item[key] as string
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    })
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }))
  }

  const departments = React.useMemo(() => groupBy("department"), [filtered])
  const sections = React.useMemo(() => groupBy("section"), [filtered])
  const designations = React.useMemo(() => groupBy("designation"), [filtered])
  const lines = React.useMemo(() => groupBy("line"), [filtered])

  const clearFilters = () => { setDeptFilter("all"); setSectionFilter("all"); setDesigFilter("all"); setLineFilter("all") }
  const hasFilters = deptFilter !== "all" || sectionFilter !== "all" || desigFilter !== "all" || lineFilter !== "all"

  const handleEdit = (d: Organization) => router.push(`/information/organization/${d.id}/edit`)
  const handleDelete = (d: Organization) => { deleteOrganization(d.id); setData(getOrganizations()) }

  const GroupedTable = ({ groups }: { groups: { group: string; items: Organization[] }[] }) => (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted border-b">
            <th className="text-left px-3 py-2.5 font-medium">Department</th>
            <th className="text-left px-3 py-2.5 font-medium">Section</th>
            <th className="text-left px-3 py-2.5 font-medium">Designation</th>
            <th className="text-left px-3 py-2.5 font-medium">Line</th>
            <th className="w-20 px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <React.Fragment key={g.group}>
              <tr className="bg-primary/5 border-b">
                <td colSpan={5} className="px-3 py-2 font-semibold text-sm">{g.group}</td>
              </tr>
              {g.items.map((item, i) => (
                <tr key={item.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/30"}`}>
                  <td className="px-3 py-2">{item.department}</td>
                  <td className="px-3 py-2">{item.section}</td>
                  <td className="px-3 py-2">{item.designation}</td>
                  <td className="px-3 py-2">{item.line}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => handleEdit(item)}>Edit</Button>
                      <Button variant="ghost" size="xs" className="text-destructive" onClick={() => handleDelete(item)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
          {groups.length === 0 && (
            <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No entries found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BuildingIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
            <p className="text-muted-foreground mt-1">Manage organizational structure</p>
          </div>
        </div>
        <Button onClick={() => router.push("/information/organization/create")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Departments</option>
                {departmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Section</label>
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Sections</option>
                {sectionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Designation</label>
              <select value={desigFilter} onChange={(e) => setDesigFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Designations</option>
                {designationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Line</label>
              <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="all">All Lines</option>
                {lineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
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

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
            <TabsTrigger value="section">Section</TabsTrigger>
            <TabsTrigger value="designation">Designation</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="all">
              <DataTable key={filtered.length} data={filtered} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
            </TabsContent>
            <TabsContent value="department">
              <GroupedTable groups={departments} />
            </TabsContent>
            <TabsContent value="section">
              <GroupedTable groups={sections} />
            </TabsContent>
            <TabsContent value="designation">
              <GroupedTable groups={designations} />
            </TabsContent>
            <TabsContent value="line">
              <GroupedTable groups={lines} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
