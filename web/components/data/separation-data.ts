"use client"

import { z } from "zod"

export interface Separation {
  id: number
  employee: string
  employeeCode: string
  department: string
  type: "Resignation" | "Termination" | "Retirement" | "Contract End" | "Other"
  date: string
  status: "Approved" | "Pending" | "Rejected"
  reason: string
}

export const separationSchema = z.object({
  employee: z.string().min(2, "Employee name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  department: z.string().min(1, "Department is required"),
  type: z.enum(["Resignation", "Termination", "Retirement", "Contract End", "Other"]),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["Approved", "Pending", "Rejected"]),
  reason: z.string().optional(),
})

export type SeparationFormData = z.infer<typeof separationSchema>

const mockSeparations: Separation[] = [
  { id: 1, employee: "Farida Begum", employeeCode: "EMP006", department: "Cleaning", type: "Resignation", date: "2026-07-01", status: "Approved", reason: "Personal reasons" },
  { id: 2, employee: "Shahin Ahmed", employeeCode: "EMP011", department: "Production", type: "Termination", date: "2026-07-05", status: "Approved", reason: "Misconduct" },
  { id: 3, employee: "Mizanur Rahman", employeeCode: "EMP012", department: "Security", type: "Resignation", date: "2026-07-10", status: "Pending", reason: "" },
  { id: 4, employee: "Selina Begum", employeeCode: "EMP013", department: "Cleaning", type: "Retirement", date: "2026-07-15", status: "Approved", reason: "Age retirement" },
  { id: 5, employee: "Asaduzzaman", employeeCode: "EMP014", department: "Logistics", type: "Resignation", date: "2026-07-20", status: "Pending", reason: "" },
  { id: 6, employee: "Nazma Akter", employeeCode: "EMP015", department: "Production", type: "Termination", date: "2026-07-25", status: "Approved", reason: "Attendance issues" },
  { id: 7, employee: "Kabir Hossain", employeeCode: "EMP016", department: "Admin", type: "Resignation", date: "2026-08-01", status: "Pending", reason: "" },
  { id: 8, employee: "Rashida Khatun", employeeCode: "EMP017", department: "QC", type: "Retirement", date: "2026-08-05", status: "Approved", reason: "Age retirement" },
]

let separations = [...mockSeparations]
let nextId = 9

export function getSeparations(): Separation[] {
  return separations
}

export function getSeparation(id: number): Separation | undefined {
  return separations.find((s) => s.id === id)
}

export function createSeparation(data: SeparationFormData): Separation {
  const s: Separation = { ...data, reason: data.reason || "", id: nextId++ }
  separations.push(s)
  return s
}

export function updateSeparation(id: number, data: Partial<SeparationFormData>): Separation | null {
  const index = separations.findIndex((s) => s.id === id)
  if (index === -1) return null
  separations[index] = { ...separations[index], ...data, reason: data.reason ?? separations[index].reason }
  return separations[index]
}

export function deleteSeparation(id: number): boolean {
  const index = separations.findIndex((s) => s.id === id)
  if (index === -1) return false
  separations.splice(index, 1)
  return true
}

export const separationTypeOptions = [
  { value: "Resignation" as const, label: "Resignation" },
  { value: "Termination" as const, label: "Termination" },
  { value: "Retirement" as const, label: "Retirement" },
  { value: "Contract End" as const, label: "Contract End" },
  { value: "Other" as const, label: "Other" },
]

export const separationStatusOptions = [
  { value: "Approved" as const, label: "Approved" },
  { value: "Pending" as const, label: "Pending" },
  { value: "Rejected" as const, label: "Rejected" },
]

export const departmentOptions = [
  "Production", "Admin", "IT", "QC", "Security", "Cleaning", "Finance", "Logistics", "HR", "Sales", "Marketing",
].map((v) => ({ value: v, label: v }))
