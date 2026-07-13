"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserXIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  separationSchema, SeparationFormData, getSeparation,
  separationTypeOptions, separationStatusOptions, departmentOptions,
} from "./separation-data"

interface SeparationFormProps {
  initialData?: Partial<SeparationFormData>
  onSuccess: (data: SeparationFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  separationId?: number
}

export function SeparationForm({ initialData, onSuccess, onCancel, isEditing = false, separationId }: SeparationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SeparationFormData>({
    resolver: zodResolver(separationSchema),
    defaultValues: {
      employee: "",
      employeeCode: "",
      department: "",
      type: "Resignation",
      date: "",
      status: "Pending",
      reason: "",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (separationId && isEditing) {
      setIsLoading(true)
      const s = getSeparation(separationId)
      if (s) {
        reset({
          employee: s.employee,
          employeeCode: s.employeeCode,
          department: s.department,
          type: s.type,
          date: s.date,
          status: s.status,
          reason: s.reason,
        })
      }
      setIsLoading(false)
    }
  }, [separationId, isEditing, reset])

  const onSubmit = async (data: SeparationFormData) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 300))
    onSuccess(data)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Label htmlFor="employeeCode">Employee Code *</Label>
              <Input id="employeeCode" {...register("employeeCode")} aria-invalid={!!errors.employeeCode} />
              {errors.employeeCode && <p className="text-sm text-destructive">{errors.employeeCode.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("department")}>
                <option value="">Select department</option>
                {departmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Separation Type *</Label>
              <select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("type")}>
                {separationTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
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
              <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("status")}>
                {separationStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" {...register("reason")} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
