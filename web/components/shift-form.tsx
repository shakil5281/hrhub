"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ClockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { shiftSchema, ShiftFormData, shiftTypeOptions, weekendDayOptions, statusOptions, getShift } from "./shift-data"

interface ShiftFormProps {
  initialData?: Partial<ShiftFormData>
  onSuccess: (data: ShiftFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  shiftId?: number
}

export function ShiftForm({ initialData, onSuccess, onCancel, isEditing = false, shiftId }: ShiftFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: "",
      shiftType: "Day",
      inTime: "",
      outTime: "",
      weekendDay: "Friday",
      status: "active",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (shiftId && isEditing) {
      setIsLoading(true)
      const shift = getShift(shiftId)
      if (shift) {
        reset({
          name: shift.name,
          shiftType: shift.shiftType,
          inTime: shift.inTime,
          outTime: shift.outTime,
          weekendDay: shift.weekendDay,
          status: shift.status,
        })
      }
      setIsLoading(false)
    }
  }, [shiftId, isEditing, reset])

  const onSubmit = async (data: ShiftFormData) => {
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
      <div className="space-y-2">
        <Label htmlFor="name">Shift Name *</Label>
        <Input
          id="name"
          placeholder="Morning Shift"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shiftType">Shift Type *</Label>
        <select
          id="shiftType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("shiftType")}
        >
          {shiftTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.shiftType && <p className="text-sm text-destructive">{errors.shiftType.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inTime">In Time *</Label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="inTime"
              type="time"
              className="pl-10"
              {...register("inTime")}
              aria-invalid={!!errors.inTime}
            />
          </div>
          {errors.inTime && <p className="text-sm text-destructive">{errors.inTime.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="outTime">Out Time *</Label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="outTime"
              type="time"
              className="pl-10"
              {...register("outTime")}
              aria-invalid={!!errors.outTime}
            />
          </div>
          {errors.outTime && <p className="text-sm text-destructive">{errors.outTime.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weekendDay">Weekend Day *</Label>
          <select
            id="weekendDay"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("weekendDay")}
          >
            {weekendDayOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.weekendDay && <p className="text-sm text-destructive">{errors.weekendDay.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("status")}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            isEditing ? "Update Shift" : "Create Shift"
          )}
        </Button>
      </div>
    </form>
  )
}
