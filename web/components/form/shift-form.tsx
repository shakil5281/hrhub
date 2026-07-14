"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CalendarIcon, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { shiftSchema, ShiftFormData, statusOptions, dayOptions } from "../data/shift-data"
import { shiftApi, companyApi } from "@/lib/api"
import type { Company } from "@/components/data/company-data"

interface ShiftFormProps {
  initialData?: Partial<ShiftFormData>
  onSuccess: () => void
  onCancel?: () => void
  isEditing?: boolean
  shiftId?: string
}

export function ShiftForm({ initialData, onSuccess, onCancel, isEditing = false, shiftId }: ShiftFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [weekendDays, setWeekendDays] = React.useState<string[]>(
    initialData?.weekend_days ? initialData.weekend_days.split(",").filter(Boolean) : []
  )

  const { handleSubmit, formState: { errors }, setValue, watch, register } = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      company_id: initialData?.company_id || "",
      name: initialData?.name || "",
      shift_type: (initialData?.shift_type as "day" | "night" | "general") || "day",
      start_time: initialData?.start_time || "",
      end_time: initialData?.end_time || "",
      late_grace_minutes: initialData?.late_grace_minutes ?? 0,
      weekend_days: initialData?.weekend_days || "",
      status: (initialData?.status as "active" | "inactive") || "active",
    },
  })

  const startTime = watch("start_time")
  const endTime = watch("end_time")
  const shiftType = watch("shift_type")
  const statusVal = watch("status")
  const companyId = watch("company_id")

  React.useEffect(() => {
    companyApi.list().then(({ data }) => {
      const list = Array.isArray(data) ? data : []
      setCompanies(list)
    }).catch(() => {})
  }, [])

  const toggleWeekendDay = (day: string) => {
    const updated = weekendDays.includes(day)
      ? weekendDays.filter((d) => d !== day)
      : [...weekendDays, day]
    setWeekendDays(updated)
    setValue("weekend_days", updated.join(","))
  }

  const onSubmit = async (data: ShiftFormData) => {
    setIsSubmitting(true)
    setError("")
    try {
      data.weekend_days = weekendDays.join(",")
      if (isEditing && shiftId) {
        await shiftApi.update(shiftId, data)
        toast.success("Shift updated successfully")
      } else {
        await shiftApi.create(data)
        toast.success("Shift created successfully")
      }
      onSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save shift"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Company *</Label>
        <Select value={companyId} onValueChange={(val) => setValue("company_id", val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.company_name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.company_id && <p className="text-sm text-destructive">{errors.company_id.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Shift Name *</Label>
          <Input
            placeholder="Morning Shift"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Shift Type *</Label>
          <Select value={shiftType} onValueChange={(val) => setValue("shift_type", val as "day" | "night" | "general")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="night">Night</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start Time *</Label>
          <TimePicker value={startTime} onChange={(val) => setValue("start_time", val)} />
          {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>End Time *</Label>
          <TimePicker value={endTime} onChange={(val) => setValue("end_time", val)} />
          {errors.end_time && <p className="text-sm text-destructive">{errors.end_time.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Late Grace (minutes)</Label>
          <Input
            type="number"
            min="0"
            {...register("late_grace_minutes", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusVal} onValueChange={(val) => setValue("status", val as "active" | "inactive")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Weekend Days</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                weekendDays.length === 0 && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {weekendDays.length > 0
                ? weekendDays.map((d) => dayOptions.find((o) => o.value === d)?.label).join(", ")
                : "Select weekend days"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-2" align="start">
            <div className="space-y-1">
              {dayOptions.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWeekendDay(day.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    weekendDays.includes(day.value) && "bg-accent"
                  )}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    weekendDays.includes(day.value) ? "bg-primary text-primary-foreground" : "opacity-50"
                  )}>
                    {weekendDays.includes(day.value) && <Check className="h-3 w-3" />}
                  </div>
                  {day.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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
