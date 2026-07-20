"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

function toIso(v: string): string {
  return v.includes("T")
    ? v.length === 16 ? v + ":00" : v
    : v + "T00:00:00"
}

function parseTime(v: string): string {
  if (!v) return ""
  if (v.includes("T")) return v.slice(11, 16)
  if (v.includes(":")) return v.slice(0, 5)
  return ""
}

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

export function DateTimePicker({ value, onChange, className, disabled }: DateTimePickerProps) {
  const iso = value ? toIso(value) : ""
  const parsed = iso ? new Date(iso) : undefined
  const dateObj = parsed && isValid(parsed) ? parsed : undefined
  const dateStr = dateObj ? format(dateObj, "yyyy-MM-dd") : ""
  const timeStr = value ? parseTime(value) : ""

  const [dateVal, setDateVal] = React.useState(dateObj)
  const [timeVal, setTimeVal] = React.useState(timeStr)

  React.useEffect(() => {
    const i = value ? toIso(value) : ""
    const p = i ? new Date(i) : undefined
    setDateVal(p && isValid(p) ? p : undefined)
    setTimeVal(value ? parseTime(value) : "")
  }, [value])

  const emit = React.useCallback((d: Date | undefined, t: string) => {
    if (d && isValid(d)) {
      const ds = format(d, "yyyy-MM-dd")
      if (t) {
        onChange?.(`${ds}T${t}`)
      } else {
        onChange?.(ds)
      }
    } else if (t) {
      onChange?.(t)
    } else {
      onChange?.("")
    }
  }, [onChange])

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DatePicker
        value={dateVal}
        onChange={(d) => {
          setDateVal(d)
          emit(d, timeVal)
        }}
        disabled={disabled}
      />
      <TimePicker
        value={timeVal}
        onChange={(t) => {
          setTimeVal(t)
          emit(dateVal, t)
        }}
        disabled={disabled}
      />
    </div>
  )
}
