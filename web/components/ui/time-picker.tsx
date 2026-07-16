"use client"

import * as React from "react"
import { ClockIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
  disabled?: boolean
}

function fmt(n: number) {
  return n.toString().padStart(2, "0")
}

const HOURS = Array.from({ length: 24 }, (_, i) => fmt(i))
const MINUTES = Array.from({ length: 60 }, (_, i) => fmt(i))
const ITEM_H = 32
const VIEW_H = 160

function TimeScroller({
  items,
  selected,
  onSelect,
  label,
}: {
  items: string[]
  selected: string
  onSelect: (v: string) => void
  label: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const programmatic = React.useRef(false)

  const scrollTo = React.useCallback((val: string) => {
    const idx = items.indexOf(val)
    if (idx < 0) return
    const el = ref.current
    if (!el) return
    programmatic.current = true
    el.scrollTop = idx * ITEM_H
    requestAnimationFrame(() => {
      programmatic.current = false
    })
  }, [items])

  React.useEffect(() => {
    scrollTo(selected)
  }, [])

  React.useEffect(() => {
    scrollTo(selected)
  }, [selected])

  const onScroll = React.useCallback(() => {
    if (programmatic.current) return
    const el = ref.current
    if (!el) return
    const idx = Math.round(el.scrollTop / ITEM_H)
    const i = Math.max(0, Math.min(idx, items.length - 1))
    const v = items[i]
    if (v !== selected) onSelect(v)
  }, [items, selected, onSelect])

  const center = VIEW_H / 2 - ITEM_H / 2

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-medium text-muted-foreground mb-2 select-none">{label}</span>
      <div className="relative" style={{ height: VIEW_H, width: 56 }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10" style={{ height: center }}>
          <div className="h-full bg-gradient-to-b from-popover to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10" style={{ height: center }}>
          <div className="h-full bg-gradient-to-t from-popover to-transparent" />
        </div>
        <div
          className="pointer-events-none absolute left-1 right-1 z-10 rounded-md bg-accent"
          style={{ top: center, height: ITEM_H }}
        />
        <div
          ref={ref}
          onScroll={onScroll}
          className="h-full overflow-y-auto"
        >
          <div style={{ height: center }} />
          {items.map((v) => (
            <button
              key={v}
              type="button"
              tabIndex={-1}
              className={cn(
                "flex h-8 w-full items-center justify-center text-sm outline-none transition-colors",
                v === selected
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
              onClick={() => onSelect(v)}
            >
              {v}
            </button>
          ))}
          <div style={{ height: center }} />
        </div>
      </div>
    </div>
  )
}

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const nowRef = React.useRef(new Date())
  const initHh = value ? value.split(":")[0] || fmt(nowRef.current.getHours()) : fmt(nowRef.current.getHours())
  const initMm = value ? value.split(":")[1] || fmt(nowRef.current.getMinutes()) : fmt(nowRef.current.getMinutes())

  const [hh, setHh] = React.useState(initHh)
  const [mm, setMm] = React.useState(initMm)
  const [open, setOpen] = React.useState(false)

  const hhRef = React.useRef<HTMLInputElement>(null)
  const mmRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value) {
      const p = value.split(":")
      setHh(p[0] || "")
      setMm(p[1] || "")
    } else {
      const n = new Date()
      setHh(fmt(n.getHours()))
      setMm(fmt(n.getMinutes()))
    }
  }, [value])

  const emit = React.useCallback((h: string, m: string) => {
    const hh = parseInt(h, 10)
    const mm = parseInt(m, 10)
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
      onChange?.(`${h.padStart(2, "0")}:${m.padStart(2, "0")}`)
    }
  }, [onChange])

  const onHhText = (v: string) => {
    const c = v.replace(/\D/g, "").slice(0, 2)
    setHh(c)
    if (c.length === 2) {
      mmRef.current?.focus()
      mmRef.current?.select()
    }
  }

  const onMmText = (v: string) => {
    const c = v.replace(/\D/g, "").slice(0, 2)
    setMm(c)
    if (c.length === 2) emit(hh, c)
  }

  const onHhBlur = () => emit(hh, mm)
  const onMmBlur = () => emit(hh, mm)

  const onClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("")
    setHh("")
    setMm("")
  }

  const display = hh && mm ? `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}` : ""

  return (
    <div className="relative flex items-center w-[124px]">
      <div className="flex items-center h-10 w-full rounded border border-input bg-transparent text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <input
          ref={hhRef}
          type="text"
          inputMode="numeric"
          placeholder="hh"
          value={hh}
          onChange={(e) => onHhText(e.target.value)}
          onBlur={onHhBlur}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="w-10 h-full text-center bg-transparent outline-none placeholder:text-muted-foreground text-sm border-r border-input"
        />
        <span className="text-muted-foreground px-0.5 select-none font-medium">:</span>
        <input
          ref={mmRef}
          type="text"
          inputMode="numeric"
          placeholder="mm"
          value={mm}
          onChange={(e) => onMmText(e.target.value)}
          onBlur={onMmBlur}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="w-10 h-full text-center bg-transparent outline-none placeholder:text-muted-foreground text-sm flex-1 min-w-0"
        />
        <div className="flex items-center pr-0.5 gap-0 shrink-0">
          {display && (
            <button
              type="button"
              onClick={onClear}
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
            <PopoverContent className="w-auto p-3" align="end" sideOffset={5}>
              <div className="flex gap-3">
                <TimeScroller
                  items={HOURS}
                  selected={hh.padStart(2, "0")}
                  onSelect={(v) => {
                    setHh(v)
                  }}
                  label="Hour"
                />
                <TimeScroller
                  items={MINUTES}
                  selected={mm.padStart(2, "0")}
                  onSelect={(v) => {
                    setMm(v)
                    emit(hh || "00", v)
                    setOpen(false)
                  }}
                  label="Minute"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
