"use client"

import { z } from "zod"
import type { Department } from "./organization-data"

export interface Requirement {
  id: string
  position: string
  department_id: string
  vacancies: number
  applicants: number
  status: "Open" | "Closed"
  priority: "High" | "Medium" | "Low"
  description: string
  created_at: string
  updated_at: string
  department?: Department
}

export const requirementSchema = z.object({
  position: z.string().min(2, "Position is required"),
  department_id: z.string().min(1, "Department is required"),
  vacancies: z.number().min(1, "At least 1 vacancy"),
  applicants: z.number().min(0, "Must be 0 or more"),
  status: z.enum(["Open", "Closed"]),
  priority: z.enum(["High", "Medium", "Low"]),
  description: z.string().optional(),
})

export type RequirementFormData = z.infer<typeof requirementSchema>

export const statusOptions = [
  { value: "Open" as const, label: "Open" },
  { value: "Closed" as const, label: "Closed" },
]

export const priorityOptions = [
  { value: "High" as const, label: "High" },
  { value: "Medium" as const, label: "Medium" },
  { value: "Low" as const, label: "Low" },
]

export const positionOptions = [
  "Senior Operator", "Operator", "Supervisor", "Manager", "Software Developer", "QC Inspector",
  "Security Guard", "Cleaner", "Accountant", "Driver", "HR Executive", "Executive", "Assistant",
  "Store Keeper", "IT Support", "Quality Inspector",
].map((v) => ({ value: v, label: v }))
