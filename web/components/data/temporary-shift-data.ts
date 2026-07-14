"use client"

import { z } from "zod"

export interface TempShift {
  id: number
  employee: string
  employeeCode: string
  shift: string
  fromDate: string
  toDate: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

export const tempShiftSchema = z.object({
  employee: z.string().min(2, "Employee name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  shift: z.string().min(1, "Shift is required"),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["Pending", "Approved", "Rejected"]),
})

export type TempShiftFormData = z.infer<typeof tempShiftSchema>

const mockTempShifts: TempShift[] = [
  { id: 1, employee: "Rafiqul Islam", employeeCode: "EMP001", shift: "Morning Shift", fromDate: "2026-07-13", toDate: "2026-07-15", reason: "Replacement", status: "Approved" },
  { id: 2, employee: "Shamima Akter", employeeCode: "EMP002", shift: "Evening Shift", fromDate: "2026-07-13", toDate: "2026-07-13", reason: "Overtime", status: "Pending" },
  { id: 3, employee: "Kamal Hossain", employeeCode: "EMP003", shift: "Night Shift", fromDate: "2026-07-14", toDate: "2026-07-16", reason: "Emergency", status: "Approved" },
  { id: 4, employee: "Nasrin Sultana", employeeCode: "EMP004", shift: "Day Shift", fromDate: "2026-07-14", toDate: "2026-07-14", reason: "Swap", status: "Pending" },
  { id: 5, employee: "Jahangir Alam", employeeCode: "EMP005", shift: "Morning Shift", fromDate: "2026-07-15", toDate: "2026-07-17", reason: "Training", status: "Approved" },
  { id: 6, employee: "Farida Begum", employeeCode: "EMP006", shift: "General Shift", fromDate: "2026-07-15", toDate: "2026-07-15", reason: "Replacement", status: "Rejected" },
  { id: 7, employee: "Abdur Rahman", employeeCode: "EMP007", shift: "Evening Shift", fromDate: "2026-07-16", toDate: "2026-07-18", reason: "Overtime", status: "Pending" },
  { id: 8, employee: "Maksuda Khatun", employeeCode: "EMP008", shift: "Night Shift", fromDate: "2026-07-16", toDate: "2026-07-16", reason: "Emergency", status: "Approved" },
]

let tempShifts = [...mockTempShifts]
let nextId = 9

export function getTempShifts(): TempShift[] {
  return tempShifts
}

export function getTempShift(id: number): TempShift | undefined {
  return tempShifts.find((s) => s.id === id)
}

export function createTempShift(data: TempShiftFormData): TempShift {
  const newItem: TempShift = { ...data, id: nextId++ }
  tempShifts.push(newItem)
  return newItem
}

export function updateTempShift(id: number, data: Partial<TempShiftFormData>): TempShift | null {
  const index = tempShifts.findIndex((s) => s.id === id)
  if (index === -1) return null
  tempShifts[index] = { ...tempShifts[index], ...data }
  return tempShifts[index]
}

export function deleteTempShift(id: number): boolean {
  const index = tempShifts.findIndex((s) => s.id === id)
  if (index === -1) return false
  tempShifts.splice(index, 1)
  return true
}

export const tempShiftStatusOptions = [
  { value: "Pending" as const, label: "Pending" },
  { value: "Approved" as const, label: "Approved" },
  { value: "Rejected" as const, label: "Rejected" },
]

export const shiftOptions = [
  { value: "Morning Shift", label: "Morning Shift" },
  { value: "Day Shift", label: "Day Shift" },
  { value: "Evening Shift", label: "Evening Shift" },
  { value: "Night Shift", label: "Night Shift" },
  { value: "General Shift", label: "General Shift" },
  { value: "Half Day Morning", label: "Half Day Morning" },
  { value: "Half Day Evening", label: "Half Day Evening" },
  { value: "Flexible Shift", label: "Flexible Shift" },
]
