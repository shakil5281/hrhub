"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserXIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  separationSchema, SeparationFormData,
  separationTypeOptions,
} from "../data/separation-data"
import { separationApi, employeeApi } from "@/lib/api"

interface SeparationFormProps {
  initialData?: Partial<SeparationFormData>
  onSuccess: () => void
  onCancel?: () => void
  isEditing?: boolean
  separationId?: string
}

export function SeparationForm({ initialData, onSuccess, onCancel, isEditing = false, separationId }: SeparationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [empLookupLoading, setEmpLookupLoading] = React.useState(false)
  const [empNotFound, setEmpNotFound] = React.useState(false)

  const { handleSubmit, formState: { errors }, setValue, watch, register, reset } = useForm<SeparationFormData>({
    resolver: zodResolver(separationSchema),
    defaultValues: {
      employee: "",
      employee_id: "",
      department_id: "",
      type: "Resignation",
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      reason: "",
      ...initialData,
    },
  })

  const empId = watch("employee_id")
  const empName = watch("employee")
  const deptId = watch("department_id")
  const typeVal = watch("type")

  const [empDeptName, setEmpDeptName] = React.useState("")
  const [empSectionName, setEmpSectionName] = React.useState("")
  const [empDesigName, setEmpDesigName] = React.useState("")
  const [empLineName, setEmpLineName] = React.useState("")

  const isLocked = !!empName && !!deptId && !isEditing

  const handleEmployeeLookup = React.useCallback(async () => {
    const code = empId?.trim()
    if (!code) return
    setEmpLookupLoading(true)
    setEmpNotFound(false)
    setError("")
    setEmpDeptName("")
    setEmpSectionName("")
    setEmpDesigName("")
    setEmpLineName("")
    try {
      const { data: emp } = await employeeApi.getByCode(code)
      setValue("employee_id", emp.employee_id)
      setValue("employee", emp.name_en)
      setValue("department_id", emp.department_id || "")
      setEmpDeptName(emp.department?.name || "")
      setEmpSectionName(emp.section_ref?.name || "")
      setEmpDesigName(emp.designation_ref?.name || "")
      setEmpLineName(emp.line_ref?.name || "")
    } catch {
      setEmpNotFound(true)
      setValue("employee", "")
      setValue("department_id", "")
      toast.error("Employee not found")
    } finally {
      setEmpLookupLoading(false)
    }
  }, [empId, setValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleEmployeeLookup()
    }
  }

  const onSubmit = async (data: SeparationFormData) => {
    setIsSubmitting(true)
    setError("")
    try {
      if (isEditing && separationId) {
        await separationApi.update(separationId, data)
        toast.success("Separation updated successfully")
      } else {
        await separationApi.create(data)
        toast.success("Separation created successfully")
      }
      onSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save separation"
      let detail = message
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        detail = axiosErr.response?.data?.error || message
      }
      setError(detail)
      toast.error(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserXIcon className="h-5 w-5" /> Employee Lookup</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="emp_search">Employee ID</Label>
              <Input
                id="emp_search"
                value={empId || ""}
                onChange={(e) => { setValue("employee_id", e.target.value); setEmpNotFound(false) }}
                onKeyDown={handleKeyDown}
                placeholder="Type employee code and press Enter"
                disabled={isEditing}
              />
              {empNotFound && <p className="text-sm text-destructive">Employee not found</p>}
            </div>
            <Button type="button" onClick={handleEmployeeLookup} disabled={empLookupLoading || isEditing || !empId?.trim()}>
              {empLookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {empName && deptId && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserXIcon className="h-4 w-4" /> Employee Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium text-sm mt-1">{empName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="font-medium text-sm mt-1">{empDeptName || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Designation</Label>
                  <p className="font-medium text-sm mt-1">{empDesigName || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Section</Label>
                  <p className="font-medium text-sm mt-1">{empSectionName || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Line</Label>
                  <p className="font-medium text-sm mt-1">{empLineName || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Separation Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">Employee Type *</Label>
                  <Select value={typeVal} onValueChange={(val) => setValue("type", val as SeparationFormData["type"])}>
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {separationTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Separation Date</Label>
                  <Input id="date" type="date" {...register("date")} disabled aria-invalid={!!errors.date} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" value="Pending" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" {...register("reason")} disabled placeholder="Optional" />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting || !empName || !deptId}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditing ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  )
}
