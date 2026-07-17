"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserXIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  separationSchema, SeparationFormData,
  separationTypeOptions, separationStatusOptions,
} from "../data/separation-data"
import { separationApi, departmentApi } from "@/lib/api"
import type { Department } from "@/components/data/organization-data"

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
  const [departments, setDepartments] = React.useState<Department[]>([])

  const { handleSubmit, formState: { errors }, setValue, watch, register } = useForm<SeparationFormData>({
    resolver: zodResolver(separationSchema),
    defaultValues: {
      employee: "",
      employee_id: "",
      department_id: "",
      type: "Resignation",
      date: "",
      status: "Pending",
      reason: "",
      ...initialData,
    },
  })

  const departmentId = watch("department_id")
  const typeVal = watch("type")
  const statusVal = watch("status")

  React.useEffect(() => {
    departmentApi.list().then(({ data }) => {
      setDepartments(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [])

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
        <CardHeader><CardTitle className="flex items-center gap-2"><UserXIcon className="h-5 w-5" /> Separation Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee Name *</Label>
              <Input id="employee" {...register("employee")} aria-invalid={!!errors.employee} />
              {errors.employee && <p className="text-sm text-destructive">{errors.employee.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_id">Emp. ID *</Label>
              <Input id="employee_id" {...register("employee_id")} aria-invalid={!!errors.employee_id} />
              {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="department_id">Department *</Label>
              <Select value={departmentId} onValueChange={(val) => setValue("department_id", val)}>
                <SelectTrigger id="department_id"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.department_id && <p className="text-sm text-destructive">{errors.department_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Separation Type *</Label>
              <Select value={typeVal} onValueChange={(val) => setValue("type", val as SeparationFormData["type"])}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {separationTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Separation Date *</Label>
              <Input id="date" type="date" {...register("date")} aria-invalid={!!errors.date} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={statusVal} onValueChange={(val) => setValue("status", val as SeparationFormData["status"])}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {separationStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" {...register("reason")} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditing ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  )
}
