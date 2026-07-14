"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { tempShiftSchema, TempShiftFormData, shiftOptions, tempShiftStatusOptions, getTempShift } from "../data/temporary-shift-data"

interface TempShiftFormProps {
  initialData?: Partial<TempShiftFormData>
  onSuccess: (data: TempShiftFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  tempShiftId?: number
}

export function TempShiftForm({ initialData, onSuccess, onCancel, isEditing = false, tempShiftId }: TempShiftFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TempShiftFormData>({
    resolver: zodResolver(tempShiftSchema),
    defaultValues: {
      employee: "",
      employeeCode: "",
      shift: "Morning Shift",
      fromDate: "",
      toDate: "",
      reason: "",
      status: "Pending",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (tempShiftId && isEditing) {
      setIsLoading(true)
      const item = getTempShift(tempShiftId)
      if (item) {
        reset({
          employee: item.employee,
          employeeCode: item.employeeCode,
          shift: item.shift,
          fromDate: item.fromDate,
          toDate: item.toDate,
          reason: item.reason,
          status: item.status,
        })
      }
      setIsLoading(false)
    }
  }, [tempShiftId, isEditing, reset])

  const onSubmit = async (data: TempShiftFormData) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    onSuccess(data)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employee">Employee Name *</Label>
          <Input id="employee" placeholder="Rafiqul Islam" {...register("employee")} aria-invalid={!!errors.employee} />
          {errors.employee && <p className="text-sm text-destructive">{errors.employee.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeCode">Employee Code *</Label>
          <Input id="employeeCode" placeholder="EMP001" {...register("employeeCode")} aria-invalid={!!errors.employeeCode} />
          {errors.employeeCode && <p className="text-sm text-destructive">{errors.employeeCode.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shift">Assigned Shift *</Label>
        <select
          id="shift"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("shift")}
        >
          {shiftOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.shift && <p className="text-sm text-destructive">{errors.shift.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fromDate">From Date *</Label>
          <Input id="fromDate" type="date" {...register("fromDate")} aria-invalid={!!errors.fromDate} />
          {errors.fromDate && <p className="text-sm text-destructive">{errors.fromDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="toDate">To Date *</Label>
          <Input id="toDate" type="date" {...register("toDate")} aria-invalid={!!errors.toDate} />
          {errors.toDate && <p className="text-sm text-destructive">{errors.toDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Input id="reason" placeholder="Replacement, Overtime, Emergency..." {...register("reason")} aria-invalid={!!errors.reason} />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("status")}
        >
          {tempShiftStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            isEditing ? "Update" : "Create"
          )}
        </Button>
      </div>
    </form>
  )
}
