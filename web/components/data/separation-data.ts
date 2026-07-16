"use client"

import { z } from "zod"
import type { Department } from "./organization-data"

export interface Separation {
  id: string
  employee: string
  employee_code: string
  department_id: string
  type: "Resignation" | "Termination" | "Retirement" | "Contract End" | "Other"
  date: string
  status: "Approved" | "Pending" | "Rejected"
  reason: string
  created_at: string
  updated_at: string
  department?: Department
}

export const separationSchema = z.object({
  employee: z.string().min(2, "Employee name is required"),
  employee_code: z.string().min(1, "Employee code is required"),
  department_id: z.string().min(1, "Department is required"),
  type: z.enum(["Resignation", "Termination", "Retirement", "Contract End", "Other"]),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["Approved", "Pending", "Rejected"]),
  reason: z.string().optional(),
})

export type SeparationFormData = z.infer<typeof separationSchema>

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
