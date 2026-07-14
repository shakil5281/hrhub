"use client"

import * as React from "react"
import { ClockIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({ value, onChange, placeholder = "Pick a time", className, disabled }: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const now = new Date()
  const [hh, setHh] = React.useState(value ? value.split(":")[0] : format(now.getHours()))
  const [mm, setMm] = React.useState(value ? value.split(":")[1] : format(now.getMinutes()))

  const hhRef = React.useRef<HTMLInputElement>(null)
  const mmRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value) {
      const parts = value.split(":")
      setHh(parts[0] || "")
      setMm(parts[1] || "")
    } else {
      const now = new Date()
      setHh(format(now.getHours()))
      setMm(format(now.getMinutes()))
    }
  }, [value])

  function format(n: number) {
    return n.toString().padStart(2, "0")
  }

  const tryComplete = (h: string, m: string) => {
    const hour = parseInt(h, 10)
    const minute = parseInt(m, 10)
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      onChange?.(`${h.padStart(2, "0")}:${m.padStart(2, "0")}`)
    }
  }

  const handleHhChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 2)
    setHh(cleaned)
    if (cleaned.length === 2) {
      mmRef.current?.focus()
      mmRef.current?.select()
    }
  }

  const handleMmChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 2)
    setMm(cleaned)
    if (cleaned.length === 2) {
      tryComplete(hh, cleaned)
    }
  }

  const handleHhBlur = () => tryComplete(hh, mm)
  const handleMmBlur = () => tryComplete(hh, mm)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("")
    setHh("")
    setMm("")
  }

  const displayValue = hh && mm ? `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}` : ""

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  const selectedHour = parseInt(hh, 10)
  const selectedMinute = parseInt(mm, 10)

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="flex items-center h-10 w-full rounded border border-input bg-transparent text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <input
          ref={hhRef}
          type="text"
          inputMode="numeric"
          placeholder="hh"
          value={hh}
          onChange={(e) => handleHhChange(e.target.value)}
          onBlur={handleHhBlur}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="w-10 h-full text-center bg-transparent outline-none placeholder:text-muted-foreground text-sm border-r border-input"
        />
        <span className="text-muted-foreground px-1 select-none font-medium">:</span>
        <input
          ref={mmRef}
          type="text"
          inputMode="numeric"
          placeholder="mm"
          value={mm}
          onChange={(e) => handleMmChange(e.target.value)}
          onBlur={handleMmBlur}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="w-10 h-full text-center bg-transparent outline-none placeholder:text-muted-foreground text-sm flex-1 min-w-0"
        />
        <div className="flex items-center pr-1 gap-0.5 shrink-0">
          {displayValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="p-1 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
              >
                <ClockIcon className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Hour</span>
                  <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                    {hours.map((h) => (
                      <Button
                        key={h}
                        variant={selectedHour === h ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-10 text-xs"
                        onClick={() => {
                          const padded = format(h)
                          setHh(padded)
                          mmRef.current?.focus()
                          if (mm) tryComplete(padded, mm)
                        }}
                      >
                        {format(h)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Minute</span>
                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                    {minutes.map((m) => (
                      <Button
                        key={m}
                        variant={selectedMinute === m ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-10 text-xs"
                        onClick={() => {
                          const padded = format(m)
                          setMm(padded)
                          tryComplete(hh || "00", padded)
                          setOpen(false)
                        }}
                      >
                        {format(m)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
