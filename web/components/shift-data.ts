"use client"

import { z } from "zod"

export interface Shift {
  id: number
  name: string
  shiftType: "Day" | "Night" | "General"
  inTime: string
  outTime: string
  weekendDay: string
  status: "active" | "inactive"
}

export const shiftSchema = z.object({
  name: z.string().min(2, "Shift name must be at least 2 characters"),
  shiftType: z.enum(["Day", "Night", "General"]),
  inTime: z.string().min(1, "In time is required"),
  outTime: z.string().min(1, "Out time is required"),
  weekendDay: z.string().min(1, "Weekend day is required"),
  status: z.enum(["active", "inactive"]),
})

export type ShiftFormData = z.infer<typeof shiftSchema>

const mockShifts: Shift[] = [
  { id: 1, name: "Morning Shift", shiftType: "Day", inTime: "06:00", outTime: "14:00", weekendDay: "Friday", status: "active" },
  { id: 2, name: "Day Shift", shiftType: "Day", inTime: "08:00", outTime: "16:00", weekendDay: "Friday", status: "active" },
  { id: 3, name: "Evening Shift", shiftType: "General", inTime: "14:00", outTime: "22:00", weekendDay: "Saturday", status: "active" },
  { id: 4, name: "Night Guard Shift", shiftType: "Night", inTime: "22:00", outTime: "06:00", weekendDay: "Saturday", status: "active" },
  { id: 5, name: "General Shift", shiftType: "General", inTime: "09:00", outTime: "17:00", weekendDay: "Friday", status: "active" },
  { id: 6, name: "Weekend Day Shift", shiftType: "Day", inTime: "08:00", outTime: "14:00", weekendDay: "Sunday", status: "active" },
  { id: 7, name: "Night Shift A", shiftType: "Night", inTime: "20:00", outTime: "06:00", weekendDay: "Friday", status: "active" },
  { id: 8, name: "Flexible Day", shiftType: "General", inTime: "07:00", outTime: "15:00", weekendDay: "Friday", status: "inactive" },
]

let shifts = [...mockShifts]
let nextId = 9

export function getShifts(): Shift[] {
  return shifts
}

export function getShift(id: number): Shift | undefined {
  return shifts.find((s) => s.id === id)
}

export function createShift(data: ShiftFormData): Shift {
  const newShift: Shift = {
    ...data,
    id: nextId++,
  }
  shifts.push(newShift)
  return newShift
}

export function updateShift(id: number, data: Partial<ShiftFormData>): Shift | null {
  const index = shifts.findIndex((s) => s.id === id)
  if (index === -1) return null
  shifts[index] = { ...shifts[index], ...data }
  return shifts[index]
}

export function deleteShift(id: number): boolean {
  const index = shifts.findIndex((s) => s.id === id)
  if (index === -1) return false
  shifts.splice(index, 1)
  return true
}

export const shiftTypeOptions = [
  { value: "Day" as const, label: "Day" },
  { value: "Night" as const, label: "Night" },
  { value: "General" as const, label: "General" },
]

export const weekendDayOptions = [
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
]

export const statusOptions = [
  { value: "active" as const, label: "Active" },
  { value: "inactive" as const, label: "Inactive" },
]
